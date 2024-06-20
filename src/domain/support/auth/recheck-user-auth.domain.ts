import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { InvalidCredentialsDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';

export type RecheckUserAuthErrors = UnknownDomainError | InvalidCredentialsDomainError;

export type RecheckUserAuthResult = Either<RecheckUserAuthErrors, null>;

export type RecheckUserAuthIO = EitherIO<RecheckUserAuthErrors, null>;

export abstract class RecheckUserAuthDomain {
  abstract byId(userId: string, password: string): RecheckUserAuthIO;
}
