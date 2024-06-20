import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { QueryPriceTableTemplateItem } from '../../../domain/_entity/query-price-table.entity';
import {
  InsufficientCreditsDomainError,
  NoProductFoundDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { BillingDto } from '../../../domain/_layer/data/dto/billing.dto';
import { ConsumptionStatementDto } from '../../../domain/_layer/data/dto/consumption-statement.dto';
import { QueryComposerDto } from '../../../domain/_layer/data/dto/query-composer.dto';
import { ConsumptionStatementRepository } from '../../../domain/_layer/infrastructure/repository/consumption-statement.repository';
import { QueryComposerRepository } from '../../../domain/_layer/infrastructure/repository/query-composer.repository';
import { ChargeUserForQueryDomain, ChargeUserIO } from '../../../domain/support/billing/charge-user-for-query.domain';
import { DeductUserCreditsIO } from '../../../domain/support/billing/deduct-user-credits.domain';
import { TransactionHelper } from '../../../infrastructure/repository/transaction.helper';
import { Currency, CurrencyUtil } from '../../../infrastructure/util/currency.util';
import { DateTimeUtil } from '../../../infrastructure/util/date-time-util.service';
import { BillingHelper } from './billing.helper';

type ChargeUserData = {
  readonly billingDto: BillingDto;
  readonly queryComposerDto: QueryComposerDto;
  readonly queryTemplateItem: QueryPriceTableTemplateItem;
};

@Injectable()
export class ChargeUserForQueryUseCase implements ChargeUserForQueryDomain {
  constructor(
    private readonly _billingHelper: BillingHelper,
    private readonly _transactionHelper: TransactionHelper,
    private readonly _queryComposerRepository: QueryComposerRepository,
    private readonly _consumptionRepository: ConsumptionStatementRepository,
    private readonly _currencyUtil: CurrencyUtil,
    private readonly _dateTimeUtil: DateTimeUtil,
  ) {}

  private _executeChargeOperation({
    billingDto,
    queryComposerDto,
    queryTemplateItem,
  }: Partial<ChargeUserData>): DeductUserCreditsIO {
    return EitherIO.fromEither(UnknownDomainError.toFn(), async () => {
      return this._transactionHelper.withTransaction(async (transactionRef: unknown) => {
        const priceInCents: number = queryTemplateItem.totalPriceCents;
        const formattedPrice: string = this._currencyUtil
          .numToCurrency(priceInCents, Currency.CENTS_PRECISION)
          .toFormat();
        const consumptionStatement: Partial<ConsumptionStatementDto> = {
          billingId: billingDto.id,
          queryCode: queryComposerDto.queryCode,
          valueInCents: priceInCents,
          tag: `${queryComposerDto.name} ${formattedPrice}`,
          payDay: this._dateTimeUtil.now().toIso(),
          isPaid: true,
        };
        const consumptionStatementDto: ConsumptionStatementDto = await this._consumptionRepository.insert(
          consumptionStatement,
          transactionRef,
        );
        const valueToDeduct: number = this._currencyUtil
          .numToCurrency(priceInCents, Currency.CENTS_PRECISION)
          .multiply(-1)
          .toInt();
        return this._billingHelper.updateUserCredits(
          transactionRef,
          valueToDeduct,
          billingDto.userId,
          null,
          consumptionStatementDto.id,
          null,
        );
      });
    });
  }

  chargeUserForQuery(userId: string, queryCode: number): ChargeUserIO {
    return this._billingHelper
      .getUserBilling(userId)
      .zip(
        this._billingHelper.getUserQueryPrice(queryCode, userId),
        (billingDto: BillingDto, queryTemplateItem: QueryPriceTableTemplateItem) => ({ billingDto, queryTemplateItem }),
      )
      .filter(InsufficientCreditsDomainError.toFn(), ({ billingDto, queryTemplateItem }: Partial<ChargeUserData>) => {
        return billingDto && queryTemplateItem && billingDto.accountFundsCents >= queryTemplateItem.totalPriceCents;
      })
      .map(async (partialChargeUserData: Partial<ChargeUserData>) => {
        const queryComposerDto: QueryComposerDto = await this._queryComposerRepository.getByQueryCode(queryCode);
        return { ...partialChargeUserData, queryComposerDto };
      })
      .filter(NoProductFoundDomainError.toFn(), ({ queryComposerDto }: Partial<ChargeUserData>) => !!queryComposerDto)
      .flatMap(this._executeChargeOperation.bind(this));
  }
}
