import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { NotificationChannel, NotificationEntity } from 'src/domain/_entity/notification.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { NotificationQueryAllFetchPayload } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import {
  GetNotificationsDomain,
  GetNotificationsIO,
  UnseenCountNotificationsResultIO,
} from 'src/domain/support/notification/get-notifications.domain';

@Injectable()
export class GetNotificationsUseCase implements GetNotificationsDomain {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _notificationInfraService: NotificationInfrastructure,
  ) {}

  getUnseenNotification(userId: string): UnseenCountNotificationsResultIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(userId))
      .map((user: UserDto) => this._notificationInfraService.getTotalOfNotificationsUnseenByUser(user.id))
      .map((total: number) => ({ total }));
  }

  getPaginated(userId: string, channel: NotificationChannel, page: number, perPage: number): GetNotificationsIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(userId))
      .map((user: UserDto) => this._notificationInfraService.getNotifications(user.id, channel, page - 1, perPage))
      .map((result: NotificationQueryAllFetchPayload): PaginationOf<NotificationEntity> => {
        const totalPages: number = Math.ceil(result.totalCount / perPage);
        const currentPage: number = page > totalPages ? totalPages : page;
        const nextPage: number = currentPage < totalPages ? currentPage + 1 : null;
        const previousPage: number = currentPage > 1 ? currentPage - 1 : null;
        const notificationEntities: ReadonlyArray<NotificationEntity> = result.data;

        return {
          totalPages: totalPages,
          amountInThisPage: notificationEntities.length,
          count: result.totalCount,
          currentPage: currentPage,
          items: notificationEntities,
          itemsPerPage: perPage,
          nextPage: nextPage,
          previousPage: previousPage,
        };
      });
  }
}
