import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { QueryFailedService, QueryStatus } from 'src/domain/_entity/query.entity';

import {
  QueryNotExistsError,
  QueryOwnerInvalid,
  QueryReproccessIsRunning,
  QueryReprocessWasProccessed,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { GetAutoReprocessQueryDto } from 'src/domain/_layer/data/dto/get-auto-reprocess-query.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { AutoReprocessQueryService } from 'src/domain/_layer/infrastructure/service/auto-reprocess.service';
import {
  ResquestAutoReprocessQueryDomain,
  ResquestAutoReprocessQueryError,
  ResquestAutoReprocessQueryIO,
} from 'src/domain/core/query/request-auto-reprocess-query.domain';

type QueryReprocessResult = { readonly query: QueryDto; readonly reprocess: GetAutoReprocessQueryDto };

@Injectable()
export class ResquestAutoReprocessQueryUseCase implements ResquestAutoReprocessQueryDomain {
  constructor(
    private readonly _queryRepository: QueryRepository,
    private readonly _autoReprocessQueryService: AutoReprocessQueryService,
  ) {}

  private _sendToReprocess() {
    return async ({ query }: QueryReprocessResult): Promise<void> => {
      const failedServices: ReadonlyArray<number> = query.failedServices.map(
        (failedService: QueryFailedService) => failedService.serviceCode,
      );

      await this._autoReprocessQueryService.requestToReprocess({
        failedServices: failedServices,
        queryCode: query.queryCode,
        queryId: query.id,
        queryKeys: query.queryKeys,
        version: query.version,
      });
    };
  }

  private _getQueryReprocess(queryId: string) {
    return async (query: QueryDto): Promise<QueryReprocessResult> => {
      const reprocess: GetAutoReprocessQueryDto = await this._autoReprocessQueryService.getByQueryId(queryId);
      return { query, reprocess };
    };
  }

  private _setStatusQuery(queryId: string) {
    return async (): Promise<void> => {
      await this._queryRepository.updateById(queryId, { queryStatus: QueryStatus.REPROCESSING });
    };
  }

  requestByQueryId(userId: string, queryId: string): ResquestAutoReprocessQueryIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () => this._queryRepository.getById(queryId))
      .filter(QueryNotExistsError.toFn(), Boolean)
      .filter(QueryOwnerInvalid.toFn(), (query: QueryDto) => query.userId === userId)
      .map(this._getQueryReprocess(queryId))
      .filter(
        QueryReproccessIsRunning.toFn(),
        ({ reprocess }: QueryReprocessResult) => reprocess?.status !== 'PROCCESSING',
      )
      .filter(
        QueryReprocessWasProccessed.toFn(),
        ({ reprocess }: QueryReprocessResult) => reprocess?.status !== 'SUCCESS',
      )
      .map(this._sendToReprocess())
      .tap(this._setStatusQuery(queryId))
      .catch((error: ResquestAutoReprocessQueryError) => Either.left(error));
  }
}
