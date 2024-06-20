import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { CarRevendorEntity } from 'src/domain/_entity/car-revendor.entity';
import { CouponEntity } from 'src/domain/_entity/coupon.entity';

import { PaymentEntity, PaymentItem } from 'src/domain/_entity/payment.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { ChannelType } from 'src/domain/_entity/user-consents.entity';
import { UserEntity } from 'src/domain/_entity/user.entity';
import { CarRevendorRepository } from 'src/domain/_layer/infrastructure/repository/car-revendor.repository';
import { CouponRepository } from 'src/domain/_layer/infrastructure/repository/coupon.repository';
import { PaymentRepository } from 'src/domain/_layer/infrastructure/repository/payment.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { AutomateData, AutomateEnum, AutomateService } from 'src/domain/_layer/infrastructure/service/automate.service';
import { ConsentsService } from 'src/domain/_layer/infrastructure/service/user-consents.service';
import { AutomatePaymentDomain, AutomatePaymentIO } from 'src/domain/support/payment/automate-payment.domain';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';

type PipelineData = {
  payment: PaymentEntity;
  coupon: string;
  user: UserEntity;
};

@Injectable()
export class AutomatePaymentUseCase implements AutomatePaymentDomain {
  constructor(
    private readonly _automateService: AutomateService,
    private readonly _paymentRepository: PaymentRepository,
    private readonly _couponRepository: CouponRepository,
    private readonly _userRepository: UserRepository,
    private readonly _userConsentService: ConsentsService,
    private readonly _carVendorRepository: CarRevendorRepository,
    private readonly _currencyUtil: CurrencyUtil,
  ) {}

  execute(paymentId: string): AutomatePaymentIO {
    return EitherIO.of(UnknownDomainError.toFn(), paymentId)
      .map(this._getPayment())
      .map(this._getCoupon())
      .map(this._getUser())
      .map(this._parseData())
      .tap(this._dispathPaymentData())
      .map(() => null);
  }

  private _getPayment() {
    return async (paymentId: string): Promise<PipelineData> => {
      const payment: PaymentEntity = await this._paymentRepository.getById(paymentId);
      return { coupon: null, user: null, payment };
    };
  }

  private _getCoupon() {
    return async (pipe: PipelineData): Promise<PipelineData> => {
      const coupon: CouponEntity = await this._couponRepository.getById(pipe.payment.couponId);
      const couponCode: string = coupon?.code ?? '-';
      return { ...pipe, coupon: couponCode };
    };
  }

  private _getUser() {
    return async (pipe: PipelineData): Promise<PipelineData> => {
      const user: UserEntity = await this._userRepository.getByPaymentId(pipe.payment.id);
      return { ...pipe, user };
    };
  }

  private _parseData() {
    return async ({ payment, coupon, user }: PipelineData): Promise<AutomateData> => {
      const totalPrice: string = this._currencyUtil.numToCurrency(payment.totalPriceInCents / 100).toFormat();
      const realPrice: string = this._currencyUtil.numToCurrency(payment.realPriceInCents / 100).toFormat();
      const createdAt: string = new Date(payment.createdAt).toLocaleString('pt-BR').replace(/\,/, '');
      const isGivenConsentWhatsapp: boolean = await this._userConsentService.isGivenConsent(
        user.id,
        ChannelType.WHATSAPP,
      );
      const carRevendor: CarRevendorEntity = await this._carVendorRepository.getById(user.id);

      return {
        dadosUsuario: {
          id: user.id,
          nome: user.name,
          email: user.email,
          telefone: user.phoneNumber,
          cidade: user.address.city,
          uf: user.address.state,
          bairro: user.address.neighborhood,
          rua: user.address.street,
          numero: user.address.number,
          origemCriacao: user.creationOrigin,
          consentimetoWhatsapp: isGivenConsentWhatsapp ? 'SIM' : 'NAO',
          revendedorDeCarro: carRevendor?.status ? 'SIM' : 'NAO',
        },
        dadosPagamento: {
          id: payment.id,
          status: payment.status,
          estaPago: payment.paid ? 'SIM' : 'NAO',
          tipo: payment.type,
          data: createdAt,
          feitoApartirDe: payment.creationOrigin,
          totalPago: totalPrice,
          precoSemDesconto: realPrice,
          cupom: coupon,
          items: payment.items.map((e: PaymentItem) => {
            const totalValue: string = this._currencyUtil.numToCurrency(e.totalValueInCents / 100).toFormat();

            return {
              name: e.name,
              valor: totalValue,
              quantidade: e.amount,
            };
          }),
        },
      };
    };
  }

  private _dispathPaymentData() {
    return async (automateData: AutomateData): Promise<void> => {
      await this._automateService.dispatch(AutomateEnum.PAYMENT, automateData);
    };
  }
}
