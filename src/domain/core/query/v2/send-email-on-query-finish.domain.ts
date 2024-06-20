import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryNotExistsError, UnknownDomainError } from 'src/domain/_entity/result.error';

export type SendEmailOnQueryFinishDomainErrors = UnknownDomainError | QueryNotExistsError;

export type SendEmailOnQueryFinishResult = Either<SendEmailOnQueryFinishDomainErrors, void>;

export type SendEmailOnQueryFinishIO = EitherIO<SendEmailOnQueryFinishDomainErrors, void>;

export abstract class SendEmailOnQueryFinishDomain {
  readonly send: (queryId: string) => SendEmailOnQueryFinishIO;
}
