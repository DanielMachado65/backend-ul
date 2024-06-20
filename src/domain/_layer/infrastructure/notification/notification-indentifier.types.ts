import { NotificationEntity } from 'src/domain/_entity/notification.entity';
import { QueryDocumentType } from 'src/domain/_entity/query.entity';
import { UserDto } from '../../data/dto/user.dto';

export type NotificationSubscriberChannel = {
  readonly _integrationId: string;
  readonly providerId: string;
  readonly credentials: {
    readonly deviceTokens: ReadonlyArray<string>;
  };
};

export type NotificationInfrastructureSubscriber = {
  readonly channels?: NotificationSubscriberChannel[];
  readonly id?: string;
  readonly subscriberId: string;
  readonly email?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly phoneNumber?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly isOnline?: boolean;
};

export enum NotificationIdentifier {
  QUERY_SUCCESS = 'query-success',
  QUERY_FAIL = 'query-fail',
  QUERY_REVISION_PLAN = 'query-revision-plan',
  QUERY_FINE = 'query-fine-alert',
  QUERY_ALERT = 'query-alert',
  QUERY_FIPE_PRICE = 'query-fipe-price',
}

export enum NotificationEmailIdentifier {
  POTENCIAL_USER = 'potencial-users',
}

export interface INotificationEmailInfrastructurePayloadMap {
  readonly [NotificationEmailIdentifier.POTENCIAL_USER]: NotificationEmailPotencialUserPayload;
}

export interface INotificationInfrastructurePayloadMap {
  readonly [NotificationIdentifier.QUERY_SUCCESS]: NotificationQueryCompletePayload;
  readonly [NotificationIdentifier.QUERY_FAIL]: NotificationQueryFailPayload;
  readonly [NotificationIdentifier.QUERY_REVISION_PLAN]: NotificationQueryRevisionPayload;
  readonly [NotificationIdentifier.QUERY_ALERT]: NotificationQueryAlertPayload;
  readonly [NotificationIdentifier.QUERY_FINE]: NotificationQueryFinePayload;
  readonly [NotificationIdentifier.QUERY_FIPE_PRICE]: NotificationQueryFipePricePayload;
}

export type NotificationQueryCompletePayload = {
  readonly queryId: string;
  readonly queryCode: number;
  readonly documentType: QueryDocumentType;
  readonly documentQuery: string;
  readonly queryName: string;
};

export type NotificationQueryFailPayload = {
  readonly documentType: QueryDocumentType;
  readonly documentQuery: string;
  readonly queryName: string;
};

export type NotificationQueryAllFetchPayload = {
  readonly page: number;
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly pageSize: number;
  readonly data: ReadonlyArray<NotificationEntity>;
};

export type NotificationQueryAlertPayload = {
  readonly userUF: string;
};

export type NotificationQueryFipePricePayload = {
  readonly variationPercent: string;
  readonly currentPrice: string;
  readonly carId: string;
  readonly plate: string;
};

export type NotificationQueryRevisionPayload = {
  readonly id: string;
  readonly date: string;
  readonly plate: string;
  readonly price?: string;
};

export type NotificationQueryFinePayload = {
  readonly id: string;
  readonly price: string;
  readonly plate: string;
  readonly description: string;
};

export type NotificationEmailPotencialUserPayload = {
  readonly users: ReadonlyArray<UserDto>;
};

export type NotificationEmailPotenicalUserInput = {
  readonly subscriberId: string;
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
};

export type NotificationInputPayload = {
  readonly id: string;
  readonly wasSeen?: boolean;
  readonly deleted?: boolean;
};

export type NotificationOuput = {
  readonly id: string;
  readonly wasSeen?: boolean;
  readonly deleted?: boolean;
  readonly error?: string;
};

export type NotificationOutputPayload = {
  readonly data: ReadonlyArray<{
    readonly _id: string;
    readonly seen: boolean;
  }>;
};
