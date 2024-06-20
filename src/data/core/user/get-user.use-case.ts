import { Injectable } from '@nestjs/common';
import { GetUserDomain, GetUserIO } from '../../../domain/core/user/get-user.domain';
import { UserHelper } from './user.helper';
@Injectable()
export class GetUserUseCase implements GetUserDomain {
  constructor(private readonly _userHelper: UserHelper) {}

  getUser(userId: string): GetUserIO {
    return this._userHelper.getUser(userId);
  }
}
