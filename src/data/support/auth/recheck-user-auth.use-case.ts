import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { RecheckUserAuthDomain, RecheckUserAuthIO } from 'src/domain/support/auth/recheck-user-auth.domain';
import { InvalidCredentialsDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { EncryptionUtil } from 'src/infrastructure/util/encryption.util';

@Injectable()
export class RecheckUserAuthUseCase implements RecheckUserAuthDomain {
  constructor(private readonly _userRepository: UserRepository, private readonly _encryptionUtil: EncryptionUtil) {}

  byId(userId: string, password: string): RecheckUserAuthIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getByIdWithPassword(userId))
      .filter(
        InvalidCredentialsDomainError.toFn(),
        (user: UserDto) => !!user && this._encryptionUtil.compare(password, user.password),
      )
      .map(() => null);
  }
}
