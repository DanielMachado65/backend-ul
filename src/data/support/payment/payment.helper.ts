import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import {
  PaymentFillingOrder,
  PaymentSplittingAbsoluteRule,
  PaymentSplittingPercentRule,
  PaymentSplittingType,
} from 'src/domain/_entity/payment-management.entity';
import { PaymentGatewayType } from 'src/domain/_entity/payment.entity';
import { UserExternalArcTenantControl } from 'src/domain/_entity/user.entity';
import { PaymentManagementDto } from 'src/domain/_layer/data/dto/payment-management.dto';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import {
  PaymentRepository,
  PaymentsSucceededByTenant,
} from 'src/domain/_layer/infrastructure/repository/payment.repository';
import { ArrayUtil } from 'src/infrastructure/util/array.util';
import { Currency, CurrencyUtil } from 'src/infrastructure/util/currency.util';
import {
  CantProcessPaymentDomainError,
  CantProcessPaymentDomainErrorDetails,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { PaymentError, PaymentResponseDto } from '../../../domain/_layer/data/dto/payment-response.dto';
import { CronJob } from 'cron';

type DomainErrorFn = (error?: unknown) => UnknownDomainError;

@Injectable()
export class PaymentHelper {
  private _tenantsInfo: ReadonlyArray<PaymentsSucceededByTenant> = [];

  constructor(
    private readonly _schedulerRegistry: SchedulerRegistry,
    private readonly _paymentRepository: PaymentRepository,
    private readonly _arrayUtil: ArrayUtil,
    private readonly _currencyUtil: CurrencyUtil,
  ) {}

  private static _getError(paymentResponse: PaymentResponseDto): DomainErrorFn {
    const paymentError: PaymentError = paymentResponse.getLeft();
    const details: CantProcessPaymentDomainErrorDetails = { message: paymentError.toString() };
    return CantProcessPaymentDomainError.toFn(details);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this._retrieveTenantsInfo();
    const job: CronJob = new CronJob('* * * * *', this._retrieveTenantsInfo.bind(this));
    this._schedulerRegistry.addCronJob('retrieve-tenants-info', job);
    job.start();
  }

  private async _retrieveTenantsInfo(): Promise<void> {
    this._tenantsInfo = await this._paymentRepository.getAmountSucceededByTenant();
  }

  validatePaymentResponse(paymentResponse: PaymentResponseDto): EitherIO<UnknownDomainError, string> {
    return paymentResponse.isRight()
      ? EitherIO.of(UnknownDomainError.toFn(), paymentResponse.getRight())
      : EitherIO.raise(PaymentHelper._getError(paymentResponse));
  }

  insertExternalPaymentId(
    internalPayment: PaymentDto,
    externalPaymentId: string,
    gateway: PaymentGatewayType,
  ): Promise<PaymentDto> {
    return this._paymentRepository.updateById(internalPayment.id, {
      ...internalPayment,
      paymentExternalRef: externalPaymentId,
      gateway: gateway,
    });
  }

  getTenantCnpj(management: PaymentManagementDto, tenants: ReadonlyArray<UserExternalArcTenantControl>): string {
    const cnpjsByPriority: ReadonlyArray<string> =
      management.splittingType === PaymentSplittingType.ABSOLUTE
        ? this._getCnpjFromAbsoluteRule(management.rules, management.fillingOrder, this._tenantsInfo)
        : this._getCnpjFromPercentRule(management.rules, this._tenantsInfo);

    const chosenTenants: ReadonlyArray<string> = cnpjsByPriority
      .map((cnpj: string) => {
        return tenants.find((tenant: UserExternalArcTenantControl) => tenant.cnpj === cnpj) ? cnpj : null;
      })
      .filter(Boolean);

    return chosenTenants.length <= 0 ? null : chosenTenants[0];
  }

  private _getCnpjFromAbsoluteRule(
    rules: ReadonlyArray<PaymentSplittingAbsoluteRule>,
    fillingOrder: PaymentFillingOrder,
    tenantsInfo: ReadonlyArray<PaymentsSucceededByTenant>,
  ): ReadonlyArray<string> {
    type Step = PaymentSplittingAbsoluteRule & PaymentsSucceededByTenant;

    const orderedTenants: ReadonlyArray<string> = rules
      .map((rule: PaymentSplittingAbsoluteRule) => {
        const tenantInfo: PaymentsSucceededByTenant = PaymentHelper._findTenantInfo(tenantsInfo, rule.cnpj);

        return tenantInfo
          ? {
              cnpj: rule.cnpj,
              fillOrder: rule.fillOrder,
              maxValueCents: rule.maxValueCents,
              paymentsAmount: tenantInfo.paymentsAmount,
              revenueInCents: tenantInfo.revenueInCents,
            }
          : {
              cnpj: rule.cnpj,
              fillOrder: rule.fillOrder,
              maxValueCents: rule.maxValueCents,
              paymentsAmount: 0,
              revenueInCents: 0,
            };
      })
      .filter((a: Step) => a.revenueInCents < a.maxValueCents)
      .sort((a: Step, b: Step) => a.fillOrder - b.fillOrder)
      .map((a: Step) => a.cnpj);

    return fillingOrder === PaymentFillingOrder.SEQUENTIAL ? orderedTenants : this._arrayUtil.shuffle(orderedTenants);
  }

  private _getCnpjFromPercentRule(
    rules: ReadonlyArray<PaymentSplittingPercentRule>,
    tenantsInfo: ReadonlyArray<PaymentsSucceededByTenant>,
  ): ReadonlyArray<string> {
    type FinalStep = PaymentsSucceededByTenant & {
      readonly rulePercent: number;
      readonly currentPercent: number;
    };
    type Step1 = Omit<FinalStep, 'currentPercent'>;

    const partialInfo: ReadonlyArray<Step1> = rules.map((rule: PaymentSplittingPercentRule) => {
      const tenantInfo: PaymentsSucceededByTenant = PaymentHelper._findTenantInfo(tenantsInfo, rule.cnpj);

      return tenantInfo
        ? {
            cnpj: rule.cnpj,
            rulePercent: rule.percent,
            paymentsAmount: tenantInfo.paymentsAmount,
            revenueInCents: tenantInfo.revenueInCents,
          }
        : {
            cnpj: rule.cnpj,
            rulePercent: rule.percent,
            paymentsAmount: 0,
            revenueInCents: 0,
          };
    });

    const totalRevenueInCents: number = partialInfo.reduce(
      (acc: number, succeeded: Step1) => acc + succeeded.revenueInCents,
      0,
    );

    return partialInfo
      .map((info: Step1) => ({
        ...info,
        currentPercent: this._calculateCurrentPercent(info.revenueInCents, totalRevenueInCents),
      }))
      .sort(PaymentHelper._diffPercent)
      .map((step: FinalStep) => step.cnpj);
  }

  private static _findTenantInfo(
    tenantsInfo: ReadonlyArray<PaymentsSucceededByTenant>,
    cnpj: string,
  ): PaymentsSucceededByTenant | undefined {
    return tenantsInfo.find((tenantInfo: PaymentsSucceededByTenant) => tenantInfo.cnpj === cnpj);
  }

  private static _randomIndex<Item>(items: ReadonlyArray<Item>): number {
    return Math.trunc(Math.random() * items.length);
  }

  private _calculateCurrentPercent(revenueInCents: number, totalRevenueInCents: number): number {
    return this._currencyUtil
      .numToCurrency((revenueInCents / totalRevenueInCents) * 100, Currency.DEFAULT_PRECISION)
      .toFloat();
  }

  private static _diffPercent<Item extends { readonly rulePercent: number; readonly currentPercent: number }>(
    itemA: Item,
    itemB: Item,
  ): number {
    const diffItemA: number = itemA.rulePercent - itemA.currentPercent;
    const diffItemB: number = itemB.rulePercent - itemB.currentPercent;
    return diffItemB - diffItemA;
  }
}
