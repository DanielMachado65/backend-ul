import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserDataImportance, UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { GetWhenUserDeletedDomain, GetWhenUserDeletedIO } from 'src/domain/core/user/get-when-user-deleted.domain';
import { DateTime, DateTimeManipulateType } from 'src/infrastructure/util/date-time-util.service';
import { UserHelper } from './user.helper';

type RelativeTime = readonly [number, DateTimeManipulateType];

@Injectable()
export class GetWhenUserDeletedUseCase implements GetWhenUserDeletedDomain {
  constructor(private readonly _userRepository: UserRepository, private readonly _userHelper: UserHelper) {}

  get(userId: string): GetWhenUserDeletedIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(userId))
      .filter(NoUserFoundDomainError.toFn(), Boolean)
      .flatMap(this._getWhenDeleted.bind(this));
  }

  private _getWhenDeleted(user: UserDto): GetWhenUserDeletedIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.hasUserAnyImportantData(user.id))
      .filter(
        NoUserFoundDomainError.toFn(),
        (dataImportance: UserDataImportance) => dataImportance !== UserDataImportance.UNKNOWN,
      )
      .flatMap(this._dataImportanceToWhenDeleted.bind(this));
  }

  private _dataImportanceToWhenDeleted(dataImportance: UserDataImportance): GetWhenUserDeletedIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._userHelper.mapUserDataImportanceToRelativeTimeToDelete(dataImportance),
    )
      .filter(UnknownDomainError.toFn(), Boolean)
      .map(([num, type]: RelativeTime) => ({
        date: DateTime.now().add(num, type).toIso(),
        hasImportantData: dataImportance === UserDataImportance.HAS_IMPORTANT,
      }));
  }
}
