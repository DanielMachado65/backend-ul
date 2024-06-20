import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { NotificationChannel, NotificationEntity } from 'src/domain/_entity/notification.entity';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { UnseenCountNotificationsOutputDto } from 'src/domain/_layer/presentation/dto/unseen-count-notifications-output.dto';

export type GetNotificationsDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type GetNotificationsResult = Either<GetNotificationsDomainErrors, PaginationOf<NotificationEntity>>;

export type GetNotificationsIO = EitherIO<GetNotificationsDomainErrors, PaginationOf<NotificationEntity>>;

export type UnseenCountNotificationsResult = Either<GetNotificationsDomainErrors, UnseenCountNotificationsOutputDto>;

export type UnseenCountNotificationsResultIO = EitherIO<
  GetNotificationsDomainErrors,
  UnseenCountNotificationsOutputDto
>;

export abstract class GetNotificationsDomain {
  abstract getPaginated(
    userId: string,
    channel: NotificationChannel,
    page: number,
    perPage: number,
  ): GetNotificationsIO;

  abstract getUnseenNotification(userId: string): UnseenCountNotificationsResultIO;
}
