import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ITriggerPayloadOptions, Novu } from '@novu/node';
import { ChannelTypeEnum, PushProviderIdEnum, TriggerRecipientsPayload } from '@novu/shared';
import { AxiosResponse } from 'axios';
import { Observable, firstValueFrom } from 'rxjs';
import {
  NotificationActionKind,
  NotificationChannel,
  NotificationEntity,
  NotificationOverrides,
  NotificationProvider,
} from 'src/domain/_entity/notification.entity';
import { QueryDocumentType } from 'src/domain/_entity/query.entity';
import {
  INotificationEmailInfrastructurePayloadMap,
  INotificationInfrastructurePayloadMap,
  NotificationEmailIdentifier,
  NotificationIdentifier,
  NotificationInfrastructureSubscriber,
  NotificationInputPayload,
  NotificationOuput,
  NotificationOutputPayload,
  NotificationQueryAlertPayload,
  NotificationQueryAllFetchPayload,
  NotificationQueryCompletePayload,
  NotificationQueryFailPayload,
  NotificationQueryFinePayload,
  NotificationQueryFipePricePayload,
  NotificationQueryRevisionPayload,
  NotificationSubscriberChannel,
} from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';
import { DateTimeUtil } from '../util/date-time-util.service';

const notificationEmailTemplateIdentifier: { readonly [key in NotificationEmailIdentifier]: string } = {
  [NotificationEmailIdentifier.POTENCIAL_USER]: 'd-da8de3f23d454c9783af3addf8000737',
};

type NotificationParserFn = (
  payload: INotificationInfrastructurePayloadMap[NotificationIdentifier],
) => NotificationPayloadInput;

type NotificationPayloadInput = {
  readonly title: string;
  readonly content: string;
  readonly sendAt?: string;
  readonly overrides?: NotificationOverrides;
};

type NotificationPayload = {
  readonly _notificationId: string;
  readonly id: string;
  readonly templateIdentifier: NotificationIdentifier;
  readonly channel: string;
  readonly content: string;
  readonly providerId?: string;
  readonly deviceTokens?: ReadonlyArray<string>;
  readonly seen?: boolean;
  readonly read?: boolean;
  readonly status?: string;
  readonly transactionId: string;
  readonly payload?: NotificationPayloadInput;
  readonly expireAt?: string;
  readonly deleted?: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly subscriber?: NotificationInfrastructureSubscriber;
  readonly overrides?: NotificationOverrides;
};

type NovuNotificationJob = {
  status: string;
  overrides: NotificationOverrides;
  type: string; //"push"
  providerId: string; //"fcm"
  id: string;
};

type NovuNotification = {
  data: {
    _id: string;
    _templateId: string;
    _environmentId: string;
    _organizationId: string;
    _subscriberId: string;
    transactionId: string;
    channels: NotificationChannel;
    to: {
      subscriberId: string;
    };
    payload: Record<string, unknown>;
    expireAt: string;
    createdAt: string;
    updatedAt: string;
    jobs: ReadonlyArray<NovuNotificationJob>;
    id: string;
  };
};

type NotificationFetchAllOutputPayload = {
  readonly page: number;
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly pageSize: number;
  readonly data: ReadonlyArray<NotificationPayload>;
};

type NotificationInfrastructureResponse = AxiosResponse<{
  readonly data: {
    readonly acknowledged: boolean;
    readonly status: string;
    readonly transactionId: string;
  };
}>;

@Injectable()
export class NovuAdapter implements NotificationInfrastructure {
  private readonly _apiKey: string;
  private readonly _baseUrl: string;
  private readonly _novu: Novu = null;
  private readonly _payloadParseMap: ReadonlyMap<NotificationIdentifier, NotificationParserFn>;

  constructor(
    private readonly _envService: EnvService,
    private readonly _httpService: HttpService,
    private readonly _dateTimeUtil: DateTimeUtil,
  ) {
    this._apiKey = this._envService.get(ENV_KEYS.NOVU_API_KEY);
    this._baseUrl = this._envService.get(ENV_KEYS.NOVU_BASE_URL);
    this._novu = new Novu(this._apiKey);
    this._payloadParseMap = new Map()
      .set(NotificationIdentifier.QUERY_SUCCESS, this._parseQuerySuccess.bind(this))
      .set(NotificationIdentifier.QUERY_FAIL, this._parseQueryFail.bind(this))
      .set(NotificationIdentifier.QUERY_ALERT, this._parseAlertQuery.bind(this))
      .set(NotificationIdentifier.QUERY_REVISION_PLAN, this._parseAlertRevisionPlan.bind(this))
      .set(NotificationIdentifier.QUERY_FINE, this._parseAlertFine.bind(this))
      .set(NotificationIdentifier.QUERY_FIPE_PRICE, this._parseAlertFipePrice.bind(this));
  }

  async dispatch<Identifier extends NotificationIdentifier>(
    identifier: Identifier,
    subscribers: ReadonlyArray<NotificationInfrastructureSubscriber>,
    input: INotificationInfrastructurePayloadMap[Identifier],
  ): Promise<void> {
    const payloadFn: NotificationParserFn = this._payloadParseMap.get(identifier);
    if (!payloadFn) throw new Error(`No notification parser found for identifier ${identifier}`);

    const { overrides, ...payloadInput }: NotificationPayloadInput = payloadFn(input);
    const toSubscribers: TriggerRecipientsPayload = this._parseSubscribers(subscribers);

    await this._novu.trigger(identifier, {
      to: toSubscribers,
      payload: {
        attachments: [],
        ...payloadInput,
      },
      overrides: overrides,
    } as ITriggerPayloadOptions);
  }

  async removeAllTokens(subscriberId: string): Promise<void> {
    const subscriber: NotificationInfrastructureSubscriber = await this.findSubscriber(subscriberId);
    if (subscriber && subscriber.channels) {
      const currentDeviceTokens: ReadonlyArray<string> = subscriber.channels.find(
        (channel: NotificationSubscriberChannel) => channel.providerId === PushProviderIdEnum.FCM,
      )?.credentials.deviceTokens;

      if (currentDeviceTokens && currentDeviceTokens.length > 0) {
        await this._novu.subscribers.setCredentials(subscriberId, PushProviderIdEnum.FCM, { deviceTokens: [] });
      }
    }
  }

  /**
   * send email using novu
   */
  async sendEmail<Identifier extends NotificationEmailIdentifier>(
    identifier: Identifier,
    subscribers: ReadonlyArray<NotificationInfrastructureSubscriber>,
    input: INotificationEmailInfrastructurePayloadMap[Identifier],
  ): Promise<boolean> {
    const toSubscribers: TriggerRecipientsPayload = this._parseSubscribers(subscribers);

    const {
      data: { data },
    }: NotificationInfrastructureResponse = await this._novu.trigger(identifier, {
      to: toSubscribers,
      payload: {},
      overrides: {
        email: {
          customData: {
            templateId: notificationEmailTemplateIdentifier[identifier],
            dynamicTemplateData: {
              ...input,
            },
          },
        },
      },
    });

    return data.acknowledged;
  }

  async addSubscriber(subscriber: NotificationInfrastructureSubscriber): Promise<NotificationInfrastructureSubscriber> {
    const response: AxiosResponse<{
      readonly data: NotificationInfrastructureSubscriber | null;
    }> = await this._novu.subscribers.identify(subscriber.subscriberId, {
      email: subscriber.email,
      phone: subscriber.phoneNumber,
      firstName: subscriber.firstName,
    });

    return response.data.data;
  }

  async setCredentials(subscriberId: string, appToken: ReadonlyArray<string>): Promise<boolean> {
    try {
      const response: AxiosResponse<unknown> = await this._novu.subscribers.setCredentials(
        subscriberId,
        PushProviderIdEnum.FCM,
        {
          deviceTokens: appToken.slice(),
        },
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error setting credentials', error);
      return false;
    }
  }

  async findSubscriber(subscriberId: string): Promise<NotificationInfrastructureSubscriber | null> {
    const subscriber: AxiosResponse<{
      readonly data: NotificationInfrastructureSubscriber | null;
    }> = await this._novu.subscribers.get(subscriberId).catch(() => null);
    return subscriber?.data.data;
  }

  async updateSubscriber(
    subscriber: NotificationInfrastructureSubscriber,
  ): Promise<NotificationInfrastructureSubscriber> {
    const response: AxiosResponse<{
      readonly data: NotificationInfrastructureSubscriber | null;
    }> = await this._novu.subscribers.update(subscriber.subscriberId, {
      email: subscriber.email,
      phone: subscriber.phoneNumber,
      firstName: subscriber.firstName,
      lastName: subscriber.lastName,
    });

    return response.data.data;
  }

  async getNotifications(
    userId: string,
    channel: NotificationChannel,
    page: number,
    perPage: number,
  ): Promise<NotificationQueryAllFetchPayload> {
    const messageRes: AxiosResponse<NotificationFetchAllOutputPayload> = await this._novu.messages.list({
      subscriberId: userId,
      page,
      channel: this._toChannelType(channel),
      limit: perPage,
    });
    const messages: NotificationFetchAllOutputPayload = messageRes.data;

    const promises: ReadonlyArray<Promise<NotificationEntity>> = messages.data.map(
      async (message: NotificationPayload) => {
        const notification: NovuNotification = await this._retrieveNovuNotification(message._notificationId);
        const overrides: NotificationOverrides = this._extractOverrides(notification);
        return { ...this._transformDtoToEntity(message), overrides: overrides };
      },
    );

    const data: ReadonlyArray<NotificationEntity> = await Promise.all(promises);

    return { ...messages, data };
  }

  async getTotalOfNotificationsUnseenByUser(subscriberId: string, isUnSeen: boolean = true): Promise<number> {
    const {
      data: {
        data: { count },
      },
    }: AxiosResponse<{ readonly data: { readonly count: number } }> = await this._novu.subscribers.getUnseenCount(
      subscriberId,
      isUnSeen,
    );

    return count;
  }

  async deleteMessages(messages: ReadonlyArray<string>): Promise<ReadonlyArray<NotificationInputPayload>> {
    const deletes: ReadonlyArray<NotificationInputPayload> = await Promise.all(
      messages.map(async (messageId: string): Promise<NotificationInputPayload> => {
        try {
          const response: AxiosResponse<unknown> = await this._novu.messages.deleteById(messageId);
          return {
            id: messageId,
            deleted: response.status === 200,
          };
        } catch (error) {
          return {
            id: messageId,
            deleted: false,
          };
        }
      }),
    );

    return deletes;
  }

  async markAsSeen(
    subscriberId: string,
    messages: ReadonlyArray<NotificationInputPayload>,
  ): Promise<ReadonlyArray<NotificationInputPayload>> {
    const updates: ReadonlyArray<NotificationInputPayload> = await Promise.all(
      messages.map(async (message: NotificationInputPayload): Promise<NotificationOuput> => {
        try {
          const response: AxiosResponse<NotificationOutputPayload> = await this._novu.subscribers.markMessageAs(
            subscriberId,
            message.id,
            {
              seen: message.wasSeen,
              read: message.wasSeen,
            },
          );

          return {
            id: response.data.data[0]._id,
            wasSeen: response.data.data[0].seen,
          };
        } catch (error) {
          return {
            id: message.id,
            wasSeen: false,
            error,
          };
        }
      }),
    );

    return updates;
  }

  private _parseSubscribers(
    subscribers: ReadonlyArray<NotificationInfrastructureSubscriber>,
  ): TriggerRecipientsPayload {
    return subscribers.map((subscriber: NotificationInfrastructureSubscriber) => ({
      subscriberId: subscriber.subscriberId,
      email: subscriber.email,
    }));
  }

  private _parseQuerySuccess(input: NotificationQueryCompletePayload): NotificationPayloadInput {
    const baseUrl: string = this._envService.get('WEB_SITE_BASE_URL');
    const queryResultUrl: string = `${baseUrl}/resultado-da-consulta?queryCode=${input.queryCode}&queryId=${input.queryId}`;
    const isPlate: boolean = input.documentType === QueryDocumentType.PLATE;
    const queryKeyTypeLabel: string = `${isPlate ? 'a' : 'o'} ${input.documentType?.toLowerCase()}`;

    const payload: object = {
      queryName: input.queryName,
      queryKeyType: queryKeyTypeLabel,
      queryKey: input.documentQuery,
      queryResultUrl,
      baseUrl,
      queryCode: input.queryCode,
      queryId: input.queryId,
    };

    return {
      ...payload,
      content: this._getContentForQuerySuccess(queryResultUrl),
      title: 'Consulta realizada com sucesso!',
      overrides: {
        data: {
          richContent: this._getContentForQuerySuccess(queryResultUrl, true),
          action: {
            kind: NotificationActionKind.INTERNAL_NAVIGATE,
            details: {
              ...payload,
            },
          },
        },
      },
    };
  }

  private _parseQueryFail(input: NotificationQueryFailPayload): NotificationPayloadInput {
    const isPlate: boolean = input.documentType === QueryDocumentType.PLATE;
    const queryKeyTypeLabel: string = `${isPlate ? 'a' : 'o'} ${input.documentType.toLowerCase()}`;

    const payload: object = {
      queryName: input.queryName,
      queryKeyType: queryKeyTypeLabel,
      queryKey: input.documentQuery,
    };

    return {
      ...payload,
      content: this._getContentForQueryFail(),
      title: 'Consulta não realizada com sucesso!',
      overrides: {
        data: {
          richContent: this._getContentForQueryFail(true),
          action: {
            kind: NotificationActionKind.INTERNAL_NAVIGATE,
            details: {
              ...payload,
            },
          },
        },
      },
    };
  }

  private _parseAlertQuery(input: NotificationQueryAlertPayload): NotificationPayloadInput {
    const title: string = 'Foi feita uma consulta do seu carro!';
    const content: string = `Seu carro foi consultado na plataforma da Olho no Carro. A pessoa que fez essa consulta é do estado: ${input.userUF} Mas fique tranquilo! Muitas pessoas costumam fazer consultas por curiosidade.`;
    const sendAt: string = this._dateTimeUtil.now().getOpenJobDate();

    return {
      sendAt: sendAt,
      title: title,
      content: content,
    };
  }

  private _parseAlertRevisionPlan(input: NotificationQueryRevisionPayload): NotificationPayloadInput {
    const title: string = 'Há uma revisão para ser feita no seu carro!';

    const content: string = this._getContentOfAlertRevisionPlan(input);
    const sendAt: string = this._dateTimeUtil.now().getOpenJobDate();

    return {
      sendAt: sendAt,
      title: title,
      content: content,
      overrides: {
        data: {
          richContent: this._getContentOfAlertRevisionPlan(input, true),
          action: {
            kind: NotificationActionKind.INTERNAL_NAVIGATE,
            details: {
              id: 'my-cars.revision-plan',
              params: {
                carId: input.id,
                plate: input.plate,
              },
            },
          },
        },
      },
    };
  }

  private _parseAlertFine(input: NotificationQueryFinePayload): NotificationPayloadInput {
    const title: string = 'Há novos registros de multas para seu carro!';

    const content: string = this._getContentForAlertFine(input.description, input.price);
    const sendAt: string = this._dateTimeUtil.now().getOpenJobDate();

    return {
      sendAt: sendAt,
      title: title,
      content: content,
      overrides: {
        data: {
          richContent: this._getContentForAlertFine(input.description, input.price, true),
          action: {
            kind: NotificationActionKind.INTERNAL_NAVIGATE,
            details: {
              id: 'my-cars.fines-and-debts',
              params: {
                carId: input.id,
                plate: input.plate,
              },
            },
          },
        },
      },
    };
  }

  private _parseAlertFipePrice(input: NotificationQueryFipePricePayload): NotificationPayloadInput {
    const title: string = 'Há uma revisão para ser feita no seu carro!';
    const sendAt: string = this._dateTimeUtil.now().getOpenJobDate();
    const content: string = this._getContentForAlertFipePrice(input.variationPercent, input.currentPrice, false);

    return {
      sendAt: sendAt,
      title: title,
      content: content,
      overrides: {
        data: {
          richContent: this._getContentForAlertFipePrice(input.variationPercent, input.currentPrice, true),
          action: {
            kind: NotificationActionKind.INTERNAL_NAVIGATE,
            details: {
              id: 'my-cars.fipe-price',
              params: {
                carId: input.carId,
                plate: input.plate,
              },
            },
          },
        },
      },
    };
  }

  private _transformDtoToEntity(payload: NotificationPayload): NotificationEntity {
    const entity: NotificationEntity = new NotificationEntity();
    entity.id = payload.id;
    entity.subject = payload.payload.title;
    entity.content = payload.payload.content;
    entity.overrides = payload.overrides;
    entity.channel = payload.channel as NotificationChannel;
    entity.provider = payload.providerId ? (payload.providerId as NotificationProvider) : NotificationProvider.FCM;
    entity.wasSeen = payload.seen ?? false;
    entity.deleted = payload.deleted ?? false;
    entity.expireAt = payload.expireAt ?? '';
    entity.createdAt = new Date(payload.createdAt).toISOString();
    entity.updatedAt = new Date(payload.updatedAt).toISOString();

    return entity as NotificationEntity;
  }

  private _toChannelType(channel: NotificationChannel): ChannelTypeEnum {
    return channel as unknown as ChannelTypeEnum;
  }

  private _getContentOfAlertRevisionPlan(
    input: NotificationQueryRevisionPayload,
    isRichContent: boolean = false,
  ): string {
    if (input.price) {
      `A revisão do seu veículo está prevista para o dia ${this._canBeStrong(
        isRichContent,
        input.date,
      )}. Confira quais peças serão verificadas nesse processo clicando aqui.`;
    }

    return `A revisão do seu veículo está prevista para o dia ${this._canBeStrong(
      isRichContent,
      input.date,
    )} e deverá custar ${this._canBeStrong(
      isRichContent,
      'R$ ' + input.price,
    )}. Clique aqui e confira quais são as peças verificadas nesse processo.`;
  }

  private _getContentForAlertFine(typeFine: string, value: string, isRichContent: boolean = false): string {
    return `Seu veículo tem um débito do tipo ${this._canBeStrong(
      isRichContent,
      typeFine,
    )} no valor de ${this._canBeStrong(
      isRichContent,
      'R$ ' + value,
    )}. Clique aqui para conferir mais detalhes e veja as condições de parcelamento que oferecemos a você.`;
  }

  private _getContentForQuerySuccess(queryResultUrl: string, _isRichContent: boolean = false): string {
    return `Sua consulta foi realizada com sucesso! Clique [aqui](${queryResultUrl}) para ver os detalhes.`;
  }

  private _getContentForQueryFail(isRichContent: boolean = false): string {
    if (isRichContent) {
      return `Sua consulta não foi realizada com sucesso.`;
    }

    return `Sua consulta não foi realizada com sucesso. Clique [aqui](https://www.olhonocarro.com.br/) para tentar novamente.`;
  }

  private _getContentForAlertFipePrice(
    variationPercent: string,
    currentPrice: string,
    isRichContent: boolean = false,
  ): string {
    return `O valor de Tabela FIPE do seu veículo subiu ${this._canBeStrong(
      isRichContent,
      variationPercent,
    )}, e agora custa ${this._canBeStrong(
      isRichContent,
      currentPrice,
    )}. Clique aqui e confira a variação de preço nos últimos seis meses!`;
  }

  private _canBeStrong(isOptional: boolean, variable: unknown): string {
    return isOptional ? `**${variable}**` : `${variable}`;
  }

  private _extractOverrides(notification: NovuNotification): NotificationOverrides {
    const jobs: ReadonlyArray<NovuNotificationJob> = notification.data.jobs
      .filter((job: NovuNotificationJob) => job.type === 'push' && job.providerId === 'fcm')
      .filter((job: NovuNotificationJob) => typeof job.overrides === 'object' && Boolean(job.overrides));

    return jobs.length > 0 ? jobs[0].overrides : null;
  }

  private async _retrieveNovuNotification(notificationId: string): Promise<NovuNotification> {
    const url: string = `${this._baseUrl}/notifications/${notificationId}`;
    const headers: {
      Authorization: string;
    } = { Authorization: `ApiKey ${this._apiKey}` };

    const response$: Observable<AxiosResponse<NovuNotification>> = this._httpService.get(url, { headers });
    const response: AxiosResponse<NovuNotification> = await firstValueFrom(response$);
    return response.data;
  }
}
