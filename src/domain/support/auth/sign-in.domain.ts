import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { InvalidCredentialsDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { TokenEntity } from 'src/domain/_entity/token.entity';
import { UserEntity } from 'src/domain/_entity/user.entity';
import { DeviceKind } from '../../_layer/infrastructure/middleware/device-info.middleware';

export type SignInDomainErrors = UnknownDomainError | InvalidCredentialsDomainError;

export type SignInResult = Either<SignInDomainErrors, TokenEntity>;

export type SignInIO = EitherIO<SignInDomainErrors, TokenEntity>;

export abstract class SignInDomain {
  readonly calculateExpiration: (deviceKind: DeviceKind) => string;
  readonly encodeToken: (user: UserEntity, expiresIn?: string) => TokenEntity;
  readonly signIn: (email: string, password: string, deviceKind: DeviceKind, reqParentId: string) => SignInIO;
}
