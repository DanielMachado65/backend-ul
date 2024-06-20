import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  InvalidCredentialsDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { UserEntity } from '../../_entity/user.entity';

export type PasswordChangeDomainErrors = UnknownDomainError | NoUserFoundDomainError | InvalidCredentialsDomainError;

export type PasswordChangeResult = Either<PasswordChangeDomainErrors, UserEntity>;

export type PasswordChangeIO = EitherIO<PasswordChangeDomainErrors, UserEntity>;

export abstract class PasswordChangeDomain {
  readonly changePassword: (token: string, password: string) => PasswordChangeIO;
}
