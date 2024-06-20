import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';

export type AutomatePaymentDomainError = UnknownDomainError;

export type AutomatePaymentIO = EitherIO<AutomatePaymentDomainError, void>;

export abstract class AutomatePaymentDomain {
  abstract execute(paymentId: string): AutomatePaymentIO;
}
