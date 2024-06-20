import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { GetUserCountDomain, GetUserCountIO } from 'src/domain/support/general/get-user-count.domain';

@Injectable()
export class GetUserCountUseCase implements GetUserCountDomain {
  constructor(private readonly _userRepository: UserRepository) {}

  getCount(): GetUserCountIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.countTotalUsers());
  }
}
