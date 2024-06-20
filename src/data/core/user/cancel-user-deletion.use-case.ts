import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { AuthHelper } from 'src/data/support/auth/auth.helper';
import { CancelUserDeletionDomain, CancelUserDeletionIO } from 'src/domain/core/user/cancel-user-deletion.domain';
import { NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import {
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
} from 'src/domain/_layer/infrastructure/service/notification';

@Injectable()
export class CancelUserDeletionUseCase implements CancelUserDeletionDomain {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _authHelper: AuthHelper,
    private readonly _notificationService: NotificationServiceGen,
  ) {}

  cancelById(userId: string): CancelUserDeletionIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getByIdWithPassword(userId))
      .filter(NoUserFoundDomainError.toFn(), Boolean)
      .map(this._recoverPass.bind(this));
  }

  cancelByEmail(email: string): CancelUserDeletionIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getByEmailWithPassword(email))
      .filter(NoUserFoundDomainError.toFn(), Boolean)
      .map(this._recoverPass.bind(this));
  }

  private async _recoverPass(user: UserDto): Promise<null> {
    const { id, name, email, password, createdAt }: UserDto = user;
    const urlToRedirect: string = this._authHelper.generateUrlToActiveUser(id, password, createdAt);
    await this._notificationService.dispatch(NotificationTransport.EMAIL, NotificationType.USER_REACTIVE_ACCESS, {
      name,
      email,
      urlToRedirect,
    });
    return null;
  }
}
