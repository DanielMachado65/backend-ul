import { Injectable } from '@nestjs/common';
import { PasswordChangeDomain, PasswordChangeIO } from '../../../domain/support/auth/password-change.domain';
import { JwtUtil } from '../../../infrastructure/util/jwt.util';
import {
  InvalidCredentialsDomainError,
  NoUserFoundDomainError,
  TokenExpiredDomainError,
  UnknownDomainError,
  UserHasWeakPasswordDomainError,
} from '../../../domain/_entity/result.error';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { UserRepository } from '../../../domain/_layer/infrastructure/repository/user.repository';
import { UserDto } from '../../../domain/_layer/data/dto/user.dto';
import { AuthHelper } from './auth.helper';
import { UserEntity } from '../../../domain/_entity/user.entity';
import { EncryptionUtil } from 'src/infrastructure/util/encryption.util';
import { UserHelper } from 'src/data/core/user/user.helper';

type TokenPayload = { readonly data: { readonly id: string } };

@Injectable()
export class PasswordChangeUseCase implements PasswordChangeDomain {
  constructor(
    private readonly _authHelper: AuthHelper,
    private readonly _userRepository: UserRepository,
    private readonly _encryptionUtil: EncryptionUtil,
    private readonly _jwtUtil: JwtUtil,
  ) {}

  private async _verifyToken({ password, createdAt }: UserDto, token: string): Promise<TokenPayload> {
    const secret: string = this._authHelper.generateChangePasswordSecret(password, createdAt);
    return this._jwtUtil.verifyToken(secret, token);
  }

  private _validateToken(token: string): (userDto: UserDto) => EitherIO<InvalidCredentialsDomainError, UserEntity> {
    return (userDto: UserDto): EitherIO<InvalidCredentialsDomainError, UserEntity> => {
      return EitherIO.from(
        (error: InvalidCredentialsDomainError) => {
          if (error.tag === 'TOKEN_EXPIRED') return new TokenExpiredDomainError();

          return new InvalidCredentialsDomainError();
        },
        () => this._verifyToken(userDto, token),
      )
        .filter(InvalidCredentialsDomainError.toFn(), (payload: TokenPayload) => !!payload?.data?.id)
        .map(() => userDto);
    };
  }

  private _updatePassword(password: string): (userDto: UserDto) => Promise<UserDto> {
    return async (userDto: UserDto): Promise<UserDto> => {
      const encryptedPassword: string = this._encryptionUtil.encrypt(password);
      return this._userRepository.updateById(userDto.id, { password: encryptedPassword });
    };
  }

  changePassword(token: string, password: string): PasswordChangeIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._jwtUtil.decodeToken<TokenPayload>(token))
      .map((payload: TokenPayload) => payload.data.id)
      .mapLeft(UnknownDomainError.toFn(), InvalidCredentialsDomainError.toFn())
      .filter(UserHasWeakPasswordDomainError.toFn(), () => UserHelper.validatePasswordStrength(password))
      .map((userId: string) => this._userRepository.getByIdWithPassword(userId))
      .filter(NoUserFoundDomainError.toFn(), (userDto: UserDto | null) => !!userDto)
      .flatMap(this._validateToken(token))
      .map(this._updatePassword(password));
  }
}
