import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { NoPaymentFoundDomainError, UnknownDomainError } from '../../_entity/result.error';

export type SendPaymentToTagManagerDomainErrors = UnknownDomainError | NoPaymentFoundDomainError;

export type SendPaymentToTagManagerIO = EitherIO<SendPaymentToTagManagerDomainErrors, boolean>;

export abstract class SendPaymentToTagManagerDomain {
  abstract send(paymentId: string): SendPaymentToTagManagerIO;
}
