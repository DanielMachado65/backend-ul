import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom, Observable } from 'rxjs';
import { QueryResponseEntity, QueryResponseStatus } from 'src/domain/_entity/query-response.entity';
import { QueryEntity } from 'src/domain/_entity/query.entity';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { TestDriveQueryDto } from 'src/domain/_layer/data/dto/test-drive-query.dto';
import { MQ } from 'src/domain/_layer/infrastructure/messaging/mq';
import {
  QueryRequestService,
  ReprocessQueryServiceInput,
  ReprocessReplacedServicesInput,
  RequestQueryServiceInput,
} from 'src/domain/_layer/infrastructure/service/query-request.service';
import { ReprocessInfosDto } from 'src/domain/core/query/v2/response-query.domain';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';
import { QueryResponseParser } from 'src/infrastructure/service/query/query-response.parser';
import { TestDriveResponseParser } from 'src/infrastructure/service/query/test-drive-response.parser';
import { PollingUtil } from 'src/infrastructure/util/polling.util';

@Injectable()
export class TetrisService implements QueryRequestService {
  private readonly _queueName: string = 'TetrisQueryQueue';
  private readonly _tetrisUrl: string;

  constructor(
    private readonly _envService: EnvService,
    private readonly _testDriveParser: TestDriveResponseParser,
    private readonly _mq: MQ,
    private readonly _queryResponseParser: QueryResponseParser,
    private readonly _httpService: HttpService,
  ) {
    this._tetrisUrl = this._envService.get('TETRIS_BASE_URL');
  }

  async requestQuery({ keys, queryRef, templateQueryRef, support }: RequestQueryServiceInput): Promise<void> {
    const applicationId: string = this._envService.get(ENV_KEYS.APPLICATION_ID);
    const queue: string = this._mq.buildQueueNameWithNodeEnv(this._queueName);

    const pattern: string = 'request_query';
    await this._mq.send(queue, {
      pattern: pattern,
      data: {
        templateQueryRef,
        queryRef,
        keys: { ...keys, engineNumber: keys.engine },
        applicationId,
        support: {
          userName: support?.userName,
          userEmail: support?.userEmail,
        },
      },
    });
  }

  async reprocessQuery({ queryRef }: ReprocessQueryServiceInput): Promise<void> {
    const applicationId: string = this._envService.get(ENV_KEYS.APPLICATION_ID);
    const queue: string = this._mq.buildQueueNameWithNodeEnv(this._queueName);

    const pattern: string = 'query_reprocess';
    await this._mq.send(queue, {
      pattern: pattern,
      data: {
        queryRef,
        applicationId,
      },
    });
  }

  async reprocessQueryByReplacedServices({ queryRef, services }: ReprocessReplacedServicesInput): Promise<void> {
    const applicationId: string = this._envService.get(ENV_KEYS.APPLICATION_ID);
    const queue: string = this._mq.buildQueueNameWithNodeEnv(this._queueName);

    const pattern: string = 'replace_services';

    await this._mq.send(queue, {
      pattern: pattern,
      data: {
        queryRef,
        services,
        applicationId,
      },
    });
  }

  async getQueryByReference(
    externalReference: string,
    requestTimeout: number = 15_000,
  ): Promise<QueryResponseDto | null> {
    const response$: Observable<AxiosResponse> = this._httpService.get(
      this._tetrisUrl + '/query/by-query-ref/' + externalReference,
      { timeout: requestTimeout },
    );
    const response: AxiosResponse = await firstValueFrom(response$);
    if (!response.data) throw Error();
    else return response.data;
  }

  async getAsyncQueryByReference(queryRef: string, requestTimeout?: number): Promise<QueryResponseDto | null> {
    return PollingUtil.polling(
      6_000,
      90_000,
      (response: QueryResponseDto, error: unknown) => (error ? false : response.status !== QueryResponseStatus.PENDING),
      () => this.getQueryByReference(queryRef, requestTimeout),
    );
  }

  parseTestDriveResponse(queryResponseDto: QueryResponseDto): Partial<TestDriveQueryDto> {
    return this._testDriveParser.parseQueryResponse(queryResponseDto);
  }

  parseQueryResponse(queryResponseDto: QueryResponseDto, reprocessInfos?: ReprocessInfosDto): Partial<QueryDto> {
    return this._queryResponseParser.parseQueryResponse(queryResponseDto, reprocessInfos);
  }

  parseCreditQuery(queryResponseDto: QueryResponseEntity): Partial<QueryEntity> {
    return this._queryResponseParser.parseCreditQueryResponse(queryResponseDto);
  }
}
