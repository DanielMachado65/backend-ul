import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { PaymentWithCreditCardLegacyDomain } from 'src/domain/support/payment/payment-with-credit-card-legacy.domain';
import { UnknownDomainError } from '../../../domain/_entity/result.error';
import { CartDto } from '../../../domain/_layer/data/dto/cart.dto';
import { PaymentResponseDto } from '../../../domain/_layer/data/dto/payment-response.dto';
import { PaymentRepository } from '../../../domain/_layer/infrastructure/repository/payment.repository';
import { PaymentService } from '../../../domain/_layer/infrastructure/service/payment.service';
import { PaymentWithCreditCardIO } from '../../../domain/support/payment/payment-with-credit-card.domain';
import { PaymentHelper } from './payment.helper';

@Injectable()
export class PaymentWithCreditCardLegacyUseCase implements PaymentWithCreditCardLegacyDomain {
  constructor(
    private readonly _paymentHelper: PaymentHelper,
    private readonly _paymentRepository: PaymentRepository,
    private readonly _paymentService: PaymentService,
  ) {}

  paymentWithCreditCard(
    userId: string,
    authToken: string,
    cardToken: string,
    cart: CartDto,
    reqParentId: string,
  ): PaymentWithCreditCardIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._paymentService.paymentWithCreditCard(userId, authToken, cardToken, cart, reqParentId),
    )
      .flatMap((paymentResponse: PaymentResponseDto) => this._paymentHelper.validatePaymentResponse(paymentResponse))
      .map((paymentId: string) => this._paymentRepository.getById(paymentId));
  }
}
