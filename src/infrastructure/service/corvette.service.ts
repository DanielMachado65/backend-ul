import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable, firstValueFrom } from 'rxjs';

import { GetAutoReprocessQueryDto } from 'src/domain/_layer/data/dto/get-auto-reprocess-query.dto';
import { MQ } from 'src/domain/_layer/infrastructure/messaging/mq';
import {
  AutoReprocessQueryService,
  ReprocessQueryInput,
} from 'src/domain/_layer/infrastructure/service/auto-reprocess.service';
import { ENV_KEYS, EnvService } from '../framework/env.service';

type RunOn = 'MOLECULAR' | 'HEXAGON' | 'TETRIS';
type OwnerOrder = 'CHECKTUDO_API' | 'ULURU_API';
type QueryStatus = 'SUCCESS' | 'PROCCESSING' | 'EXPIRED_TIME';

type GetAutoReprocessQueryPorviderDto = {
  readonly queryRef: string;
  readonly templateQueryRef: number;
  readonly status: QueryStatus;
  readonly runOn: RunOn;
  readonly ownerOrder: OwnerOrder;
  readonly executionTurn: number;
  readonly keys: object;
  readonly serviceCodes: ReadonlyArray<number>;
  readonly createdAt?: Date;
};

type GetAutoReprocessQueryResult = { readonly data: GetAutoReprocessQueryPorviderDto };
type DeleteAutoReprocessQueryResult = { readonly data: void };

@Injectable()
export class CorvetteService implements AutoReprocessQueryService {
  private readonly _corvetteBaseUrl: string = this._envService.get(ENV_KEYS.CORVETTE_BASE_URL);

  constructor(
    private readonly _mq: MQ,
    private readonly _httpService: HttpService,
    private readonly _envService: EnvService,
  ) {}

  async getByQueryId(queryId: string): Promise<GetAutoReprocessQueryDto> {
    try {
      const url: string = `${this._corvetteBaseUrl}/reprocess/${queryId}`;
      const response$: Observable<GetAutoReprocessQueryResult> = this._httpService.get(url);
      const fistValue: GetAutoReprocessQueryResult = await firstValueFrom(response$);

      return {
        status: fistValue.data.status,
        createdAt: fistValue.data.createdAt,
      };
    } catch (error) {
      return null;
    }
  }

  async requestToReprocess({
    queryCode,
    failedServices,
    queryId,
    queryKeys,
    version = 1,
  }: ReprocessQueryInput): Promise<void> {
    const queue: string = this._mq.buildQueueNameWithNodeEnv('CorvetteQueue');

    if (version === 1) {
      await this._mq.send(queue, {
        pattern: 'reprocess_query',
        data: {
          queryRef: queryId,
          templateQueryRef: queryCode,
          runOn: 'MOLECULAR',
          serviceCodes: failedServices,
          ownerOrder: 'ULURU_API',
          keys: queryKeys,
        },
      });
    } else if (version === 2) {
      await this._mq.send(queue, {
        pattern: 'reprocess_query',
        data: {
          queryRef: queryId,
          templateQueryRef: queryCode,
          runOn: 'TETRIS',
          serviceCodes: [],
          ownerOrder: 'ULURU_API',
          keys: {},
        },
      });
    }
  }

  async cancelReprocess(queryId: string): Promise<void> {
    const url: string = `${this._corvetteBaseUrl}/reprocess/${queryId}`;
    const response$: Observable<DeleteAutoReprocessQueryResult> = this._httpService.delete(url);
    await firstValueFrom(response$);
  }
}
