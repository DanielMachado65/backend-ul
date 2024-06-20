import { Injectable } from '@nestjs/common';
import {
  INotificationEmailInfrastructurePayloadMap,
  INotificationInfrastructurePayloadMap,
  NotificationEmailIdentifier,
  NotificationIdentifier,
  NotificationInfrastructureSubscriber,
  NotificationInputPayload,
  NotificationQueryAllFetchPayload,
} from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';

@Injectable()
export class NovuAdapterMock implements NotificationInfrastructure {
  async dispatch<Identifier extends NotificationIdentifier>(
    _identifier: Identifier,
    _subscribers: readonly NotificationInfrastructureSubscriber[],
    _input: INotificationInfrastructurePayloadMap[Identifier],
  ): Promise<void> {
    return Promise.resolve();
  }

  async removeAllTokens(_subscriberId: string): Promise<void> {
    return Promise.resolve();
  }

  async sendEmail<Identifier extends NotificationEmailIdentifier>(
    _identifier: Identifier,
    _subscribers: readonly NotificationInfrastructureSubscriber[],
    _input: INotificationEmailInfrastructurePayloadMap[Identifier],
  ): Promise<boolean> {
    return Promise.resolve(true);
  }

  async addSubscriber(
    _subscriber: NotificationInfrastructureSubscriber,
  ): Promise<NotificationInfrastructureSubscriber> {
    return Promise.resolve({
      subscriberId: '123',
      email: 'test',
      firstName: 'da',
      phoneNumber: '124123',
    });
  }
  async setCredentials(_subscriberId: string, _credentials: readonly string[]): Promise<boolean> {
    return Promise.resolve(true);
  }

  async findSubscriber(_subscriberId: string): Promise<NotificationInfrastructureSubscriber> {
    return Promise.resolve({
      subscriberId: '123',
      email: 'test',
      firstName: 'da',
      phoneNumber: '124123',
    });
  }

  async updateSubscriber(
    _subscriber: NotificationInfrastructureSubscriber,
  ): Promise<NotificationInfrastructureSubscriber> {
    return Promise.resolve({
      subscriberId: '123',
      email: 'test',
      firstName: 'da',
      phoneNumber: '124123',
    });
  }

  async getNotifications(_userId: string): Promise<NotificationQueryAllFetchPayload> {
    return Promise.resolve({
      data: [],
      hasMore: false,
      page: 1,
      pageSize: 1,
      totalCount: 1,
    });
  }

  async getTotalOfNotificationsUnseenByUser(_userId: string): Promise<number> {
    return Promise.resolve(1);
  }

  async deleteMessages(_messages: readonly string[]): Promise<ReadonlyArray<NotificationInputPayload>> {
    return Promise.resolve([]);
  }

  async markAsSeen(
    _subscriberId: string,
    _messages: ReadonlyArray<NotificationInputPayload>,
  ): Promise<ReadonlyArray<NotificationInputPayload>> {
    return Promise.resolve([]);
  }
}
