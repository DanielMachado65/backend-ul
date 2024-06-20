import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UserAddress, UserEntity } from 'src/domain/_entity/user.entity';
import {
  EmailAlreadyInUseByAnotherUserDomainError,
  UnauthorizedExceptionDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';

export type UpdateUserProfileDomainErrors =
  | UnknownDomainError
  | EmailAlreadyInUseByAnotherUserDomainError
  | UnauthorizedExceptionDomainError;

export type UpdateUserProfileParams = {
  readonly name: string;
  readonly email: string;
  readonly phoneNumber?: string;
  readonly address?: UserAddress;
  readonly currentPassword?: string;
  readonly newPassword?: string;
};

export type UpdateUserProfileResult = Either<UpdateUserProfileDomainErrors, UserEntity>;

export type UpdateUserProfileIO = EitherIO<UpdateUserProfileDomainErrors, UserEntity>;

export abstract class UpdateUserProfileDomain {
  readonly updateUser: (id: string, user: UpdateUserProfileParams) => UpdateUserProfileIO;
}
