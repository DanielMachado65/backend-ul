import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';

export type GetUserPaymentHistoryDomainErrors = UnknownDomainError;

export type GetUserPaymentHistoryResult = Either<GetUserPaymentHistoryDomainErrors, PaginationOf<PaymentDto>>;

export type GetUserPaymentHistoryIO = EitherIO<GetUserPaymentHistoryDomainErrors, PaginationOf<PaymentDto>>;

export abstract class GetUserPaymentHistoryDomain {
  readonly getUserPaymentHistory: (
    userId: string,
    page: number,
    perPage: number,
    search: string,
  ) => GetUserPaymentHistoryIO;
}
