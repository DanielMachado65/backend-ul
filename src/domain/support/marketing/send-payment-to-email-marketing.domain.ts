import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { NoPaymentFoundDomainError, NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';

export type SendPaymentToEmailMarketingDomainErrors =
  | UnknownDomainError
  | NoPaymentFoundDomainError
  | NoUserFoundDomainError;

export type SendPaymentToEmailMarketingIO = EitherIO<SendPaymentToEmailMarketingDomainErrors, boolean>;

export abstract class SendPaymentToEmailMarketingDomain {
  abstract send(paymentId: string): SendPaymentToEmailMarketingIO;
}
