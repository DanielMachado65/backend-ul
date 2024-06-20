import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { NoPaymentFoundDomainError, NoUserFoundDomainError, UnknownDomainError } from '../../_entity/result.error';

export type AddIndicatedPaymentDomainErrors = UnknownDomainError | NoPaymentFoundDomainError | NoUserFoundDomainError;

export type AddIndicatedPaymentIO = EitherIO<AddIndicatedPaymentDomainErrors, boolean>;

export abstract class AddIndicatedPaymentDomain {
  readonly addIndicatedPayment: (paymentId: string) => AddIndicatedPaymentIO;
}
