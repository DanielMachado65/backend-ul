import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UpdateNotificationDto } from 'src/domain/_layer/presentation/dto/update-notifications-input.dto';
import { UpdateNotificationsOutputDto } from 'src/domain/_layer/presentation/dto/update-notifications-output.dto';

export type UpdateNotificationsDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type UpdateNotificationsResult = Either<UpdateNotificationsDomainErrors, UpdateNotificationsOutputDto>;

export type UpdateNotificationsIO = EitherIO<UpdateNotificationsDomainErrors, UpdateNotificationsOutputDto>;

export abstract class UpdateNotificationsDomain {
  abstract updateNotifications(
    userId: string,
    notifications: ReadonlyArray<UpdateNotificationDto>,
  ): UpdateNotificationsIO;
}
