import { NotificationChannel } from 'src/domain/_entity/notification.entity';
import {
  INotificationInfrastructurePayloadMap,
  NotificationIdentifier,
  NotificationQueryAllFetchPayload,
  type NotificationInfrastructureSubscriber,
  type NotificationInputPayload,
  NotificationEmailIdentifier,
  INotificationEmailInfrastructurePayloadMap,
} from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';

export class NotificationInfrastructure {
  removeAllTokens: (subscriberId: string) => Promise<void>;
  dispatch: <Identifier extends NotificationIdentifier>(
    identifier: Identifier,
    subscribers: ReadonlyArray<NotificationInfrastructureSubscriber>,
    input: INotificationInfrastructurePayloadMap[Identifier],
  ) => Promise<void>;

  sendEmail: <Identifier extends NotificationEmailIdentifier>(
    identifier: Identifier,
    subscribers: ReadonlyArray<NotificationInfrastructureSubscriber>,
    input: INotificationEmailInfrastructurePayloadMap[Identifier],
  ) => Promise<boolean>;

  addSubscriber: (subscriber: NotificationInfrastructureSubscriber) => Promise<NotificationInfrastructureSubscriber>;
  setCredentials: (subscriberId: string, credentials: ReadonlyArray<string>) => Promise<boolean>;

  findSubscriber: (subscriberId: string) => Promise<NotificationInfrastructureSubscriber | null>;
  getNotifications: (
    subscriberId: string,
    channel: NotificationChannel,
    page?: number,
    perPage?: number,
  ) => Promise<NotificationQueryAllFetchPayload>;
  updateSubscriber: (subscriber: NotificationInfrastructureSubscriber) => Promise<NotificationInfrastructureSubscriber>;
  getTotalOfNotificationsUnseenByUser: (subscriberId: string, isUnSeen?: boolean) => Promise<number>;

  deleteMessages: (messsages: ReadonlyArray<string>) => Promise<ReadonlyArray<NotificationInputPayload>>;
  markAsSeen: (
    subscriberId: string,
    messages: ReadonlyArray<NotificationInputPayload>,
  ) => Promise<ReadonlyArray<NotificationInputPayload>>;
}
