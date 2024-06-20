import { AlertFineNotification } from 'src/domain/_notification/alert-fine.notification';
import { AlertFipePriceNotification } from 'src/domain/_notification/alert-fipe-price.notification';
import { AlertOnQueryMakeNotification } from 'src/domain/_notification/alert-on-query-make.notification';
import { AlertRevisionPlanNotification } from 'src/domain/_notification/alert-revision-plan.notification';
import { QueryAutoReprocessFailedNotification } from 'src/domain/_notification/query-auto-reprocess-failed.notification';
import { QueryAutoReprocessSuccessedNotification } from 'src/domain/_notification/query-auto-reprocess-successed.notification';
import { QueryFailNotification, QuerySuccessNotification } from 'src/domain/_notification/query.notification';
import { UserAlreadyRegisteredNotification } from 'src/domain/_notification/user-already-registered.notification';
import { UserReactiveAccesssNotification } from 'src/domain/_notification/user-reactive-access.notification';
import { UserRecoverPasswordNotification } from 'src/domain/_notification/user-recover-password.notification';
import { createNotificationService } from './notification-gen.service';
import { NotificationType } from './notification-types.enum';
import { ContactSupportNotification } from 'src/domain/_notification/contact-support';

export * from './notification-gen.service';
export * from './notification-transport.enum';
export * from './notification-types.enum';

export class NotificationServiceGen extends createNotificationService()
  .addNotificationType(NotificationType.CONTACT_SUPPORT, ContactSupportNotification)
  .addNotificationType(NotificationType.USER_ALREADY_REGISTERED, UserAlreadyRegisteredNotification)
  .addNotificationType(NotificationType.USER_RECOVER_PASSWORD, UserRecoverPasswordNotification)
  .addNotificationType(NotificationType.USER_REACTIVE_ACCESS, UserReactiveAccesssNotification)
  .addNotificationType(NotificationType.QUERY_AUTO_REPROCESS_SUCCESS, QueryAutoReprocessSuccessedNotification)
  .addNotificationType(NotificationType.QUERY_AUTO_REPROCESS_FAILED, QueryAutoReprocessFailedNotification)
  .addNotificationType(NotificationType.QUERY_SUCCESS, QuerySuccessNotification)
  .addNotificationType(NotificationType.QUERY_FAIL, QueryFailNotification)
  .addNotificationType(NotificationType.QUERY_ALERT, AlertOnQueryMakeNotification)
  .addNotificationType(NotificationType.QUERY_REVISION_PLAN, AlertRevisionPlanNotification)
  .addNotificationType(NotificationType.QUERY_FINE, AlertFineNotification)
  .addNotificationType(NotificationType.QUERY_FIPE_PRICE, AlertFipePriceNotification)
  .done() {}
