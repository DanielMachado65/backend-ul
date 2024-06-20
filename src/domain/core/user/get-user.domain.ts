import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UserEntity } from '../../_entity/user.entity';
import { NoUserFoundDomainError, UnknownDomainError } from '../../_entity/result.error';

export type GetUserDomainErrors = UnknownDomainError | NoUserFoundDomainError;

export type GetUserResult = Either<GetUserDomainErrors, UserEntity>;

export type GetUserIO = EitherIO<GetUserDomainErrors, UserEntity>;

export abstract class GetUserDomain {
  readonly getUser: (userId: string) => GetUserIO;
}
