import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';

export type CancelUserDeletionDomainErrors = UnknownDomainError | NoUserFoundDomainError;

export type CancelUserDeletionResult = Either<CancelUserDeletionDomainErrors, null>;

export type CancelUserDeletionIO = EitherIO<CancelUserDeletionDomainErrors, null>;

export abstract class CancelUserDeletionDomain {
  abstract cancelById(userId: string): CancelUserDeletionIO;

  abstract cancelByEmail(userId: string): CancelUserDeletionIO;
}
