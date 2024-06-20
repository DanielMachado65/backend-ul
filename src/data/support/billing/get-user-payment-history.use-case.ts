import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  GetUserPaymentHistoryDomain,
  GetUserPaymentHistoryIO,
} from 'src/domain/core/query/get-user-payment-history.domain';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { PaymentRepository } from 'src/domain/_layer/infrastructure/repository/payment.repository';

@Injectable()
export class GetUserPaymentHistoryUseCase implements GetUserPaymentHistoryDomain {
  constructor(private readonly _paymentRepository: PaymentRepository) {}

  getUserPaymentHistory(userId: string, page: number, perPage: number, search: string): GetUserPaymentHistoryIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => userId).map(
      async (id: string) => await this._paymentRepository.getByUserIdWithCount(id, page, perPage, search),
    );
  }
}
