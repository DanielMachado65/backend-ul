import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';

export type PasswordRecoveryDomainErrors = UnknownDomainError;

export type PasswordRecoveryResult = Either<PasswordRecoveryDomainErrors, null>;

export type PasswordRecoveryIO = EitherIO<PasswordRecoveryDomainErrors, null>;

export abstract class PasswordRecoveryDomain {
  readonly recoverPassword: (email: string, cpf: string) => PasswordRecoveryIO;
}
