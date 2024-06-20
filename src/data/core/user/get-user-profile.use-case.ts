import { GetUserProfileIO } from '../../../domain/core/user/get-user-profile.domain';
import { UserHelper } from './user.helper';
import { Injectable } from '@nestjs/common';
import { GetUserProfileDomain } from 'src/domain/core/user/get-user-profile.domain';
@Injectable()
export class GetUserProfileUseCase implements GetUserProfileDomain {
  constructor(private readonly _userHelper: UserHelper) {}
  getUserProfile(userId: string): GetUserProfileIO {
    return this._userHelper.getUser(userId).map(this._userHelper.userToUserProfile.bind(this._userHelper));
  }
}
