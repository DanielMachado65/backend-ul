import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { GetPaymentStatusDomain, GetPaymentStatusIO } from '../../../domain/support/payment/get-payment-status.domain';
import { NoPaymentFoundDomainError, UnknownDomainError } from '../../../domain/_entity/result.error';
import { PaymentStatusDto } from '../../../domain/_layer/data/dto/payment-status.dto';
import { PaymentDto } from '../../../domain/_layer/data/dto/payment.dto';
import { PaymentRepository } from '../../../domain/_layer/infrastructure/repository/payment.repository';

@Injectable()
export class GetPaymentStatusUseCase implements GetPaymentStatusDomain {
  constructor(private readonly _paymentRepository: PaymentRepository) {}

  private static _parseToPaymentStatusDto(payment: PaymentDto): PaymentStatusDto {
    return {
      id: payment.id,
      type: payment.type,
      status: payment.status,
      pix: payment.pix,
      bankingBillet: payment.bankingBillet,
    };
  }

  getPaymentStatus(userId: string, paymentId: string): GetPaymentStatusIO {
    const getPaymentFn: () => Promise<PaymentDto | null> = () =>
      this._paymentRepository.getByUserAndPaymentId(userId, paymentId);

    return EitherIO.from(UnknownDomainError.toFn(), getPaymentFn)
      .filter(NoPaymentFoundDomainError.toFn(), (payment: PaymentDto | null) => !!payment)
      .map(GetPaymentStatusUseCase._parseToPaymentStatusDto);
  }
}
