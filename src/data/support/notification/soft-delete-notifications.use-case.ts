import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { BadRequestDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { NotificationInputPayload } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import {
  SoftDeleteNotificationsDomain,
  SoftDeleteNotificationsIO,
} from 'src/domain/support/notification/soft-delete-notifications.domain';

@Injectable()
export class SoftDeleteNotificationsUseCase implements SoftDeleteNotificationsDomain {
  constructor(
    private readonly _notificationInfraService: NotificationInfrastructure,
    private readonly _userRepository: UserRepository,
  ) {}

  softDeleteNotifications(userId: string, notifications: readonly string[]): SoftDeleteNotificationsIO {
    return EitherIO.of(UnknownDomainError.toFn(), notifications)
      .filter(BadRequestDomainError.toFn(), SoftDeleteNotificationsUseCase._validateNotifications)
      .flatMap(() => this._getUser(userId))
      .flatMap(() => this._deleteMessageEitherIO(notifications.slice()))
      .map((deletedNotification: ReadonlyArray<NotificationInputPayload>) => {
        return {
          notifications: deletedNotification.map((notification: NotificationInputPayload) => ({
            id: notification.id,
            deleted: notification.deleted,
          })),
        };
      });
  }

  private _getUser(userId: string): EitherIO<UnknownDomainError, { readonly user: UserDto }> {
    return EitherIO.from<UnknownDomainError, UserDto>(UnknownDomainError.toFn(), () =>
      this._userRepository.getById(userId),
    )
      .filter(UnknownDomainError.toFn(), (user: UserDto | null) => user !== null)
      .map((user: UserDto) => ({ user }));
  }

  private static _validateNotifications(notifications: ReadonlyArray<string>): boolean {
    return notifications.length > 0;
  }

  private _transformPayload(notification: ReadonlyArray<string>): ReadonlyArray<string> {
    return notification.slice();
  }

  private _deleteMessageEitherIO(
    notifications: ReadonlyArray<string>,
  ): EitherIO<UnknownDomainError, ReadonlyArray<NotificationInputPayload>> {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._notificationInfraService.deleteMessages(this._transformPayload(notifications)),
    );
  }
}
