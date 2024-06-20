import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserDataImportance, UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { SetUserToDeletionDomain, SetUserToDeletionIO } from 'src/domain/core/user/set-user-to-deletion.domain';
import { DateTime, DateTimeManipulateType } from 'src/infrastructure/util/date-time-util.service';
import { UserHelper } from './user.helper';

@Injectable()
export class SetUserToDeletionUseCase implements SetUserToDeletionDomain {
  constructor(private readonly _userRepository: UserRepository, private readonly _userHelper: UserHelper) {}

  setUserToDeletion(userId: string): SetUserToDeletionIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.hasUserAnyImportantData(userId))
      .map((importanceData: UserDataImportance) => this._deleteBasedOnImportance(userId, importanceData))
      .filter(NoUserFoundDomainError.toFn(), Boolean)
      .map((user: UserDto) => this._userHelper.userToUserProfile(user));
  }

  private _deleteBasedOnImportance(userId: string, importanceData: UserDataImportance): Promise<UserDto | null> {
    type RelativeTime = readonly [number, DateTimeManipulateType];
    const result: RelativeTime = this._userHelper.mapUserDataImportanceToRelativeTimeToDelete(importanceData);

    if (result) {
      const [value, unit]: RelativeTime = result;

      const date: Date = DateTime.now().add(value, unit).toDate();
      date.setSeconds(0);
      date.setMinutes(0);
      date.setHours(0);

      return this._userRepository.setToDeletion(userId, date);
    } else {
      return this._userRepository.getById(userId);
    }
  }
}
