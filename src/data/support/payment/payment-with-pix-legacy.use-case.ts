import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { PaymentWithPixLegacyDomain } from 'src/domain/support/payment/payment-with-pix-legacy.domain';
import { UnknownDomainError } from '../../../domain/_entity/result.error';
import { CartDto } from '../../../domain/_layer/data/dto/cart.dto';
import { PaymentResponseDto } from '../../../domain/_layer/data/dto/payment-response.dto';
import { PaymentRepository } from '../../../domain/_layer/infrastructure/repository/payment.repository';
import { PaymentService } from '../../../domain/_layer/infrastructure/service/payment.service';
import { PaymentWithPixIO } from '../../../domain/support/payment/payment-with-pix.domain';
import { PaymentHelper } from './payment.helper';

@Injectable()
export class PaymentWithPixLegacyUseCase implements PaymentWithPixLegacyDomain {
  constructor(
    private readonly _paymentHelper: PaymentHelper,
    private readonly _paymentRepository: PaymentRepository,
    private readonly _paymentService: PaymentService,
  ) {}

  paymentWithPix(userId: string, authToken: string, cart: CartDto, reqParentId: string): PaymentWithPixIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._paymentService.paymentWithPix(userId, authToken, cart, reqParentId),
    )
      .flatMap((paymentResponse: PaymentResponseDto) => this._paymentHelper.validatePaymentResponse(paymentResponse))
      .map((paymentId: string) => this._paymentRepository.getById(paymentId));
  }
}
