import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { NoPaymentFoundDomainError, UnknownDomainError } from '../../_entity/result.error';
import { PaymentStatusDto } from '../../_layer/data/dto/payment-status.dto';

export type GetPaymentStatusDomainErrors = UnknownDomainError | NoPaymentFoundDomainError;

export type GetPaymentStatusResult = Either<GetPaymentStatusDomainErrors, PaymentStatusDto>;

export type GetPaymentStatusIO = EitherIO<GetPaymentStatusDomainErrors, PaymentStatusDto>;

export abstract class GetPaymentStatusDomain {
  readonly getPaymentStatus: (userId: string, paymentId: string) => GetPaymentStatusIO;
}
