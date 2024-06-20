import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { PaymentEntity } from 'src/domain/_entity/payment.entity';
import { NoPaymentFoundDomainError, UnknownDomainError } from '../../_entity/result.error';

export type GetPaymentDomainErrors = UnknownDomainError | NoPaymentFoundDomainError;

export type GetPaymentResult = Either<GetPaymentDomainErrors, PaymentEntity>;

export type GetPaymentIO = EitherIO<GetPaymentDomainErrors, PaymentEntity>;

export abstract class GetPaymentDomain {
  readonly getPayment: (paymentId: string) => GetPaymentIO;
}
