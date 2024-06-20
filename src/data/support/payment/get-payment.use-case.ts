import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { NoPaymentFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import { PaymentRepository } from 'src/domain/_layer/infrastructure/repository/payment.repository';
import { GetPaymentDomain, GetPaymentIO } from 'src/domain/support/payment/get-payment.domain';

@Injectable()
export class GetPaymentUseCase implements GetPaymentDomain {
  constructor(private readonly _paymentRepository: PaymentRepository) {}

  getPayment(paymentId: string): GetPaymentIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._paymentRepository.getById(paymentId)).filter(
      NoPaymentFoundDomainError.toFn(),
      (payment: PaymentDto | null) => !!payment,
    );
  }
}
