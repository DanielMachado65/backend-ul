import {
  AxiosFulfilledInterceptor,
  AxiosInterceptor,
  AxiosRejectedInterceptor,
  AxiosResponseCustomConfig,
} from '@narando/nest-axios-interceptor';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpLogRepository } from 'src/domain/_layer/infrastructure/repository/http-log.repository';
import { EventEmitterService } from 'src/domain/_layer/infrastructure/service/event/event.service';
import { AppEventDispatcher } from '../decorators/events.decorator';

type CustomConfig = {
  readonly id: string;
  readonly parentId: string;
  readonly target: string;
  readonly reqBody: Record<string, unknown> | null;
  readonly reqHeaders: Record<string, unknown>;
  readonly reqMethod: string;
  readonly reqQuery: Record<string, unknown>;
  readonly reqUrl: string;
  readonly startAt: string;
};

const LOGGING_CONFIG_KEY: unique symbol = Symbol('kLoggingAxiosInterceptor');

interface ILoggingConfig extends InternalAxiosRequestConfig {
  // eslint-disable-next-line functional/prefer-readonly-type
  [LOGGING_CONFIG_KEY]: CustomConfig;
}

@Injectable()
export class LoggingAxiosInterceptor extends AxiosInterceptor<ILoggingConfig> {
  static readonly ULURU_PARENT_ID_HEADER: string = 'X-Uluru-Parent-Id';
  static readonly ULURU_TARGET_HEADER: string = 'X-Uluru-Target';

  constructor(
    private readonly _httpLogRepository: HttpLogRepository,
    @AppEventDispatcher() private readonly _eventEmitterService: EventEmitterService,
    httpService: HttpService,
  ) {
    super(httpService);
  }

  protected override requestFulfilled(): AxiosFulfilledInterceptor<ILoggingConfig> {
    return this.requestRejected();
  }

  protected override requestRejected(): AxiosRejectedInterceptor {
    return (config: ILoggingConfig) => {
      if (!config[LOGGING_CONFIG_KEY] || Object.keys(config[LOGGING_CONFIG_KEY]).length <= 0) {
        config[LOGGING_CONFIG_KEY] = {
          id: this._httpLogRepository.generateNewId(),
          parentId: LoggingAxiosInterceptor._getParentId(config),
          target: LoggingAxiosInterceptor._getTarget(config),
          reqBody: config.data || null,
          reqHeaders: config.headers,
          reqMethod: config.method,
          reqQuery: LoggingAxiosInterceptor._parseQueryParams(config.url),
          reqUrl: config.url,
          startAt: new Date().toISOString(),
        };
      }

      return config;
    };
  }

  protected override responseFulfilled(): AxiosFulfilledInterceptor<AxiosResponseCustomConfig<ILoggingConfig>> {
    return this._dispatchHttpLog.bind(this);
  }

  protected override responseRejected(): AxiosRejectedInterceptor {
    return this._dispatchHttpLog.bind(this);
  }

  static makeLogHeaders(parentId: string, target: string, headers: Record<string, unknown> = {}): AxiosHeaders {
    return typeof parentId !== 'string' || !parentId
      ? (headers as AxiosHeaders)
      : ({
          ...headers,
          [LoggingAxiosInterceptor.ULURU_PARENT_ID_HEADER]: parentId,
          [LoggingAxiosInterceptor.ULURU_TARGET_HEADER]: target.toLowerCase(),
        } as AxiosHeaders);
  }

  private _dispatchHttpLog(res: AxiosResponse): AxiosResponseCustomConfig<ILoggingConfig> {
    try {
      const { id, parentId, target, reqBody, reqHeaders, reqMethod, reqQuery, reqUrl, startAt }: CustomConfig =
        res?.config[LOGGING_CONFIG_KEY];

      this._eventEmitterService.dispatchHttpRequestFinished({
        httpLog: {
          id: id,
          parentId: parentId,
          target: target,
          actor: 'axios',
          method: reqMethod,
          url: reqUrl,
          statusCode: res.status || res['errno'],
          requestHeaders: reqHeaders,
          requestParams: {
            queryParams: reqQuery,
            body: reqBody,
          },
          responseHeaders: { ...res.headers },
          responseBody: { ...res.data },
          startAt: startAt,
          endAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      // Noop
    }

    return res as AxiosResponseCustomConfig<ILoggingConfig>;
  }

  private static _getParentId(config: ILoggingConfig): string {
    return typeof config !== 'object' ||
      typeof config.headers !== 'object' ||
      typeof config.headers[LoggingAxiosInterceptor.ULURU_PARENT_ID_HEADER] !== 'string'
      ? null
      : config.headers[LoggingAxiosInterceptor.ULURU_PARENT_ID_HEADER];
  }

  private static _getTarget(config: ILoggingConfig): string {
    return typeof config !== 'object' ||
      typeof config.headers !== 'object' ||
      typeof config.headers[LoggingAxiosInterceptor.ULURU_TARGET_HEADER] !== 'string'
      ? 'unknown'
      : config.headers[LoggingAxiosInterceptor.ULURU_TARGET_HEADER];
  }

  private static _parseQueryParams(url: string): Record<string, unknown> {
    if (!url) return {};

    const encodedUrl: string = encodeURI(decodeURI(url));
    const params: string = encodedUrl.split('?')[1];

    return [...new URLSearchParams(params)].reduce((acc: Record<string, unknown>, pair: readonly [string, string]) => {
      const [key, value]: readonly [string, string] = pair;
      acc[key] = value;
      return acc;
    }, {});
  }
}
