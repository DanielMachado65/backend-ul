import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  EmailAlreadyInUseByAnotherUserDomainError,
  NoUserFoundDomainError,
  UnauthorizedExceptionDomainError,
  UnknownDomainError,
  UserHasWeakPasswordDomainError,
} from 'src/domain/_entity/result.error';
import { UserAddress } from 'src/domain/_entity/user.entity';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import {
  UpdateUserProfileDomain,
  UpdateUserProfileIO,
  UpdateUserProfileParams,
} from 'src/domain/core/user/update-user.domain';
import { EncryptionUtil } from 'src/infrastructure/util/encryption.util';
import { UserHelper } from './user.helper';

type ParseOut<Error> = EitherIO<Error, Partial<UserDto>>;

@Injectable()
export class UpdateUserProfileUseCase implements UpdateUserProfileDomain {
  constructor(private readonly _userRepository: UserRepository, private readonly _encryptionUtil: EncryptionUtil) {}

  updateUser(id: string, params: UpdateUserProfileParams): UpdateUserProfileIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getByIdWithPassword(id))
      .filter(NoUserFoundDomainError.toFn(), Boolean)
      .flatMap((user: UserDto) => this._parseParams(user, params))
      .map((parsedParams: Partial<UserDto>) => this._updateUserWithParams(id, parsedParams));
  }

  private _parseParams(user: UserDto, params: UpdateUserProfileParams): ParseOut<UnknownDomainError> {
    return this._combineParsers([
      this._parseContact(params.name, params.phoneNumber),
      this._parseEmail(user, params.email),
      this._parseAddress(user, params.address),
      this._parsePassword(user, params.newPassword, params.currentPassword),
    ]);
  }

  // Merges the result of all either ios into a single partial user object
  private _combineParsers(parsers: ReadonlyArray<ParseOut<UnknownDomainError>>): ParseOut<UnknownDomainError> {
    return parsers.reduce((next: ParseOut<UnknownDomainError>, acc: ParseOut<UnknownDomainError>) =>
      acc.zip(next, (v1: Partial<UserDto>, v2: Partial<UserDto>) => ({ ...v1, ...v2 })),
    );
  }

  private _parseContact(name: string, phone: string): ParseOut<UnknownDomainError> {
    return EitherIO.of(UnknownDomainError.toFn(), {
      name: name ? UserHelper.validateAndFixName(name) : undefined,
      phoneNumber: phone ? phone : undefined,
    });
  }

  private _parseEmail(
    user: UserDto,
    email: string,
  ): ParseOut<EmailAlreadyInUseByAnotherUserDomainError | UnknownDomainError> {
    return Boolean(email)
      ? EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getByEmail(email))
          .filter(
            EmailAlreadyInUseByAnotherUserDomainError.toFn(),
            (maybeUser: UserDto | null) => !Boolean(maybeUser) || maybeUser?.id === user.id,
          )
          .map(() => ({ email }))
      : EitherIO.of(UnknownDomainError.toFn(), {});
  }

  private _parsePassword(
    user: UserDto,
    newPassword: string | undefined,
    currentPassword: string | undefined,
  ): ParseOut<UnknownDomainError | UnauthorizedExceptionDomainError> {
    const isAllDefined: boolean = Boolean(newPassword && (currentPassword || user.needsPasswordUpdate));

    return EitherIO.of(UnknownDomainError.toFn(), {})
      .filter(UnknownDomainError.toFn(), () => isAllDefined)
      .filter(UnauthorizedExceptionDomainError.toFn(), () => {
        if (user.needsPasswordUpdate) {
          return true;
        }

        return this._encryptionUtil.compare(currentPassword, user.password);
      })
      .filter(UserHasWeakPasswordDomainError.toFn(), () => UserHelper.validatePasswordStrength(newPassword))
      .map(
        (): Partial<UserDto> => ({
          password: this._encryptionUtil.encrypt(newPassword),
          needsPasswordUpdate: user.needsPasswordUpdate ? false : undefined,
        }),
      )
      .catch((error: UnknownDomainError | UserHasWeakPasswordDomainError | UnauthorizedExceptionDomainError) => {
        if (error instanceof UnauthorizedExceptionDomainError || error instanceof UserHasWeakPasswordDomainError) {
          return Either.left(error);
        }

        return Either.right({});
      });
  }

  private _parseAddress(_user: UserDto, address: UserAddress): ParseOut<UnknownDomainError> {
    return EitherIO.of(UnknownDomainError.toFn(), {
      address: address
        ? UserHelper.truncateAddress(UserHelper.removeDiacriticAndSpecialCharactersFromAddress(address))
        : address,
    });
  }

  private _updateUserWithParams(id: string, params: Partial<UserDto>): Promise<UserDto> {
    return this._userRepository.updateById(id, params);
  }
}
