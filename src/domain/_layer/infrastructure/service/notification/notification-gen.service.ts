/* eslint-disable functional/prefer-readonly-type */
import { Type } from '@nestjs/common';
import { NotificationType } from './notification-types.enum';
import { NotificationTransport } from './notification-transport.enum';

type RecordKeyType = string | number | symbol;
type ErrorBrand<Err extends NotificationType> = { [k in Err]: void };

// eslint-disable-next-line @typescript-eslint/no-unused-vars,functional/prefer-readonly-type
type MapKeys<Map> = Map extends [infer Key, infer Value] ? (Key extends NotificationType ? Key : never) : never;
type MapLookup<Map, Key extends RecordKeyType> = Map extends [Key, infer Value] ? Value : never;
type AddToTypeMap<Map, Key extends RecordKeyType, Value> = Map | [Key, Value];

export type PayloadType = unknown;
type AssertNewNotificationType<Id extends NotificationType, NotificationMap> = Id extends MapKeys<NotificationMap>
  ? ErrorBrand<`'${Id}' has already been declared`>
  : Id;
type AssertExistingNotificationType<Id extends NotificationType, NotificationMap> = Id extends MapKeys<NotificationMap>
  ? Id
  : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ErrorBrand<`'${Id}' has not been declared. Make sure that the component was registered during building process`>;
type AssertPayloadMatchNotificationType<
  Id extends NotificationType,
  NotificationMap,
> = Id extends MapKeys<NotificationMap>
  ? MapLookup<NotificationMap, Id>
  : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ErrorBrand<`Props does not match`>;

type CreateNotificationServiceFunc = () => {
  addNotificationType: AddNotificationTypeFunc<never>;
};

type AddNotificationTypeFunc<NotificationMap> = <Id extends NotificationType, Payload extends PayloadType>(
  id: AssertNewNotificationType<Id, NotificationMap>,
  payload: Type<Payload>,
) => AddNotificationBuilder<AddToTypeMap<NotificationMap, Id, Payload>>;

type AddNotificationBuilder<NotificationMap> = {
  readonly addNotificationType: AddNotificationTypeFunc<NotificationMap>;
  readonly done: DoneFunc<NotificationMap>;
};

type DoneFunc<NotificationMap> = () => DoneBuilder<NotificationMap>;

type DoneBuilder<NotificationMap> = Type<NotificationManager<NotificationMap>>;

export type DispatchFunc = (
  transport: NotificationTransport,
  id: NotificationType,
  payload: PayloadType,
) => Promise<boolean>;

type SendFunc<NotificationMap> = <Id extends NotificationType>(
  transport: NotificationTransport,
  id: AssertExistingNotificationType<Id, NotificationMap>,
  payload: AssertPayloadMatchNotificationType<Id, NotificationMap>,
) => Promise<boolean>;

export const createNotificationService: CreateNotificationServiceFunc = () => {
  return { addNotificationType: addNotificationType<never>() };
};

const addNotificationType = <NotificationMap>(): AddNotificationTypeFunc<NotificationMap> => {
  return <Id extends NotificationType, Payload extends PayloadType>(
    _id: AssertNewNotificationType<Id, NotificationMap>,
    _payload: Type<Payload>,
  ): AddNotificationBuilder<AddToTypeMap<NotificationMap, Id, Payload>> => {
    type NewNotificationMap = AddToTypeMap<NotificationMap, Id, Payload>;

    return {
      addNotificationType: addNotificationType<NewNotificationMap>(),
      done: done<NewNotificationMap>(),
    };
  };
};

const done = <NotificationMap>(): DoneFunc<NotificationMap> => {
  return (): DoneBuilder<NotificationMap> => {
    class NotificationManagerImpl implements NotificationManager<NotificationMap> {
      dispatch: SendFunc<NotificationMap> = <Id extends NotificationType>(
        _transport: NotificationTransport,
        _id: AssertExistingNotificationType<Id, NotificationMap>,
        _payload: AssertPayloadMatchNotificationType<Id, NotificationMap>,
      ): Promise<boolean> => null;
    }
    return NotificationManagerImpl;
  };
};

export abstract class NotificationManager<NotificationMap> {
  dispatch: SendFunc<NotificationMap>;
}
