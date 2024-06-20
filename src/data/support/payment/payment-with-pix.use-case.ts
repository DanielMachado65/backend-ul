import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { PaymentType } from 'src/domain/_entity/payment.entity';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { PaymentResponseDto } from 'src/domain/_layer/data/dto/payment-response.dto';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { CreateInternalPaymentDomain } from 'src/domain/support/payment/create-internal-payment.domain';
import { CartDto } from '../../../domain/_layer/data/dto/cart.dto';
import {
  PaymentWithPixDomain,
  PaymentWithPixExtras,
  PaymentWithPixIO,
} from '../../../domain/support/payment/payment-with-pix.domain';
import { PaymentHelper } from './payment.helper';

type InternalAndExternalPayment = {
  readonly internalPayment: PaymentDto;
  readonly externalPaymentId: string;
};

@Injectable()
export class PaymentWithPixUseCase implements PaymentWithPixDomain {
  constructor(
    private readonly _paymentHelper: PaymentHelper,
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _createInternalPayment: CreateInternalPaymentDomain,
  ) {}

  paymentWithPix(userId: string, cart: CartDto, reqParentId: string, extras: PaymentWithPixExtras): PaymentWithPixIO {
    return this._createInternalPayment
      .call(userId, cart, PaymentType.PIX, extras)
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
      this._paymentGatewayService.paymentWithPix(userId, payment, reqParentId),
    )
      .flatMap((response: PaymentResponseDto) => this._paymentHelper.validatePaymentResponse(response))
      .map((externalPaymentId: string) => ({ internalPayment: payment, externalPaymentId: externalPaymentId }));
  }
}
