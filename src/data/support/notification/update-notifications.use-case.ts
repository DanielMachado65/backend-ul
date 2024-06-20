import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { BadRequestDomainError, NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { NotificationInputPayload } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { UpdateNotificationDto } from 'src/domain/_layer/presentation/dto/update-notifications-input.dto';
import {
  UpdateNotificationsDomain,
  UpdateNotificationsIO,
} from 'src/domain/support/notification/update-notifications.domain';

@Injectable()
export class UpdateNotificationsUseCase implements UpdateNotificationsDomain {
  constructor(
    private readonly _notificationInfraService: NotificationInfrastructure,
    private readonly _userRepository: UserRepository,
  ) {}

  updateNotifications(userId: string, notifications: ReadonlyArray<UpdateNotificationDto>): UpdateNotificationsIO {
    return EitherIO.of(UnknownDomainError.toFn(), notifications)
      .filter(BadRequestDomainError.toFn(), UpdateNotificationsUseCase._validateNotifications)
      .flatMap(() => this._getUser(userId))
      .flatMap(({ user }: { readonly user: UserDto }) => this._markAsSeenEitherIO(user.id, notifications))
      .map((updatedNotifications: ReadonlyArray<NotificationInputPayload>) => {
        return {
          notifications: updatedNotifications.map((notification: NotificationInputPayload) => {
            return {
              id: notification.id,
              updated: notification.wasSeen,
            };
          }),
        };
      });
  }

  private static _validateNotifications(notifications: ReadonlyArray<UpdateNotificationDto>): boolean {
    return notifications.every((notification: UpdateNotificationDto) => notification.notificationId !== null);
  }

  private _getUser(userId: string): EitherIO<NoUserFoundDomainError, { readonly user: UserDto }> {
    return EitherIO.from<UnknownDomainError, UserDto>(UnknownDomainError.toFn(), () =>
      this._userRepository.getById(userId),
    )
      .filter(NoUserFoundDomainError.toFn(), (user: UserDto | null) => user !== null)
      .map((user: UserDto) => ({ user }));
  }

  private _transformPayload(notifications: ReadonlyArray<UpdateNotificationDto>): readonly NotificationInputPayload[] {
    return notifications.map((notification: UpdateNotificationDto) => ({
      id: notification.notificationId,
      wasSeen: notification.wasSeen,
    }));
  }

  private _markAsSeenEitherIO(
    subscriberId: string,
    notifications: ReadonlyArray<UpdateNotificationDto>,
  ): EitherIO<UnknownDomainError, ReadonlyArray<NotificationInputPayload>> {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._notificationInfraService.markAsSeen(subscriberId, this._transformPayload(notifications)),
    );
  }
}
