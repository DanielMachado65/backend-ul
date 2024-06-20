import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { SoftDeleteNotificationsOutputDto } from 'src/domain/_layer/presentation/dto/soft-delete-notifications-output.dto';

export type SoftDeleteNotificationsDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type SoftDeleteNotificationsResult = Either<
  SoftDeleteNotificationsDomainErrors,
  SoftDeleteNotificationsOutputDto
>;

export type SoftDeleteNotificationsIO = EitherIO<SoftDeleteNotificationsDomainErrors, SoftDeleteNotificationsOutputDto>;

export abstract class SoftDeleteNotificationsDomain {
  abstract softDeleteNotifications(userId: string, notifications: ReadonlyArray<string>): SoftDeleteNotificationsIO;
}
