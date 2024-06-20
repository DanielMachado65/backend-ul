import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { CarNotFoundError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { NotificationIdentifier } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';

export type DispatchNotificationDto = unknown;

export type DispatchNotificationErrors = UnknownDomainError | CarNotFoundError;

export type DispatchNotificationResult = Either<DispatchNotificationErrors, DispatchNotificationDto>;

export type DispatchNotificationIO = EitherIO<DispatchNotificationErrors, DispatchNotificationDto>;

export abstract class DispatchNotificationDomain {
  abstract send(event: NotificationIdentifier): DispatchNotificationIO;
}
