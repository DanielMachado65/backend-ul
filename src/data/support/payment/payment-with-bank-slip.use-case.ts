import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { PaymentType } from 'src/domain/_entity/payment.entity';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { CreateInternalPaymentDomain } from 'src/domain/support/payment/create-internal-payment.domain';
import { ProviderUnavailableDomainError } from '../../../domain/_entity/result.error';
import { CartDto } from '../../../domain/_layer/data/dto/cart.dto';
import { PaymentResponseDto } from '../../../domain/_layer/data/dto/payment-response.dto';
import {
  PaymentWithBankSlipDomain,
  PaymentWithBankSlipExtras,
  PaymentWithBankSlipIO,
} from '../../../domain/support/payment/payment-with-bank-slip.domain';
import { PaymentHelper } from './payment.helper';

type InternalAndExternalPayment = {
  readonly internalPayment: PaymentDto;
  readonly externalPaymentId: string;
};

@Injectable()
export class PaymentWithBankSlipUseCase implements PaymentWithBankSlipDomain {
  constructor(
    private readonly _paymentHelper: PaymentHelper,
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _createInternalPayment: CreateInternalPaymentDomain,
  ) {}

  paymentWithBankSlip(
    userId: string,
    cart: CartDto,
    reqParentId: string,
    extras: PaymentWithBankSlipExtras,
  ): PaymentWithBankSlipIO {
    return this._createInternalPayment
      .call(userId, cart, PaymentType.BANKING_BILLET, extras)
      .flatMap((payment: PaymentDto) => this._createExternalPayment(userId, payment, reqParentId))
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
    reqParentId: string,
  ): EitherIO<ProviderUnavailableDomainError, InternalAndExternalPayment> {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._paymentGatewayService.paymentWithBankSlip(userId, payment, reqParentId),
    )
      .flatMap((response: PaymentResponseDto) => this._paymentHelper.validatePaymentResponse(response))
      .map((externalPaymentId: string) => ({ internalPayment: payment, externalPaymentId: externalPaymentId }));
  }
}
