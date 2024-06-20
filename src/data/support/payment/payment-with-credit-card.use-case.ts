import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { PaymentType } from 'src/domain/_entity/payment.entity';
import { TokenEntity } from 'src/domain/_entity/token.entity';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { CreateInternalPaymentDomain } from 'src/domain/support/payment/create-internal-payment.domain';
import { ObjectUtil } from 'src/infrastructure/util/object.util';
import { ProviderUnavailableDomainError } from '../../../domain/_entity/result.error';
import { CartDto } from '../../../domain/_layer/data/dto/cart.dto';
import { PaymentResponseDto } from '../../../domain/_layer/data/dto/payment-response.dto';
import {
  PaymentWithCreditCardDomain,
  PaymentWithCreditCardExtras,
  PaymentWithCreditCardIO,
} from '../../../domain/support/payment/payment-with-credit-card.domain';
import { PaymentHelper } from './payment.helper';

type InternalAndExternalPayment = {
  readonly internalPayment: PaymentDto;
  readonly externalPaymentId: string;
};

@Injectable()
export class PaymentWithCreditCardUseCase implements PaymentWithCreditCardDomain {
  constructor(
    private readonly _paymentHelper: PaymentHelper,
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _createInternalPayment: CreateInternalPaymentDomain,
    private readonly _objectUtil: ObjectUtil,
  ) {}

  paymentWithCreditCard(
    userId: string,
    cardToken: TokenEntity,
    cart: CartDto,
    reqParentId: string,
    extras: PaymentWithCreditCardExtras,
  ): PaymentWithCreditCardIO {
    return this._createInternalPayment
      .call(userId, cart, PaymentType.CREDIT_CARD, extras)
      .flatMap((payment: PaymentDto) => this._createExternalPayment(userId, payment, cardToken, reqParentId))
      .map(({ internalPayment, externalPaymentId }: InternalAndExternalPayment) =>
        this._paymentHelper.insertExternalPaymentId(
          internalPayment,
          externalPaymentId,
          this._paymentGatewayService.gateway,
        ),
      );
  }

  private _createExternalPayment(
    userId: string,
    payment: PaymentDto,
    cardToken: TokenEntity,
    reqParentId: string,
  ): EitherIO<ProviderUnavailableDomainError, InternalAndExternalPayment> {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._paymentGatewayService.paymentWithCreditCard(userId, payment, cardToken, reqParentId),
    )
      .flatMap((response: PaymentResponseDto) => this._paymentHelper.validatePaymentResponse(response))
      .map((externalPaymentId: string) => ({
        internalPayment: this._objectUtil.deepMerge(payment, { creditCard: { token: cardToken.token } }),
        externalPaymentId: externalPaymentId,
      }));
  }
}
