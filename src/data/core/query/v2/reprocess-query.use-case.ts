import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { QueryStatus } from 'src/domain/_entity/query.entity';
import {
  QuerWithoutFailedServicesError,
  QueryAlreadyReprocessingError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { AutoReprocessQueryService } from 'src/domain/_layer/infrastructure/service/auto-reprocess.service';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import {
  ReprocessQueryDomain,
  ReprocessQueryDomainErrors,
  ReprocessQueryIO,
} from 'src/domain/core/query/v2/reprocess-query.domain';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';

@Injectable()
export class ReprocessQueryUseCase implements ReprocessQueryDomain {
  constructor(
    private readonly _queryRepository: QueryRepository,
    private readonly _dateTimeUtil: DateTimeUtil,
    private readonly _queryRequestService: QueryRequestService,
    private readonly _autoReprocessQueryService: AutoReprocessQueryService,
  ) {}

  reprocessQuery(queryId: string): ReprocessQueryIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () => await this._queryRepository.getById(queryId)).flatMap(
      (queryDto: QueryDto) => this._checkReprocess(queryDto),
    );
  }

  private static _hasFailedServices(queryDto: QueryDto): boolean {
    return queryDto.failedServices?.length > 0;
  }

  private _checkReprocess(queryDto: QueryDto): EitherIO<UnknownDomainError, QueryDto> {
    const queryStatus: QueryStatus = queryDto.queryStatus;
    return (
      EitherIO.of(UnknownDomainError.toFn(), queryDto)
        .filter(QuerWithoutFailedServicesError.toFn(), (query: QueryDto) =>
          ReprocessQueryUseCase._hasFailedServices(query),
        )
        .filter(
          QueryAlreadyReprocessingError.toFn(),
          (query: QueryDto) => query.queryStatus !== QueryStatus.REPROCESSING,
        )
        // .filter(QueryReprocessMaxRetryAttempsError.toFn(), (queryDto: QueryDto) => queryDto.reprocess?.requeryTries <= 0)
        .map(async (query: QueryDto) => {
          await this._queryRequestService.reprocessQuery({ queryRef: query.id });
          return query;
        })
        .tap(async (query: QueryDto) => {
          await this._autoReprocessQueryService.cancelReprocess(query.id);
        })
        .map((query: QueryDto) =>
          this._queryRepository.updateById(query.id, {
            ...query,
            queryStatus: QueryStatus.REPROCESSING,
            failedServices: [],
            reprocess: {
              lastRetryAt: this._dateTimeUtil.now().toDate(),
              requeryTries: query.reprocess?.requeryTries - 1 || 1,
            },
          }),
        )
        .catch(async (error: ReprocessQueryDomainErrors) => {
          await this._queryRepository.updateById(queryDto.id, {
            ...queryDto,
            queryStatus,
            reprocess: {
              lastRetryAt: this._dateTimeUtil.now().toDate(),
              requeryTries: queryDto.reprocess?.requeryTries - 1 || 1,
            },
          });
          return Either.left(error);
        })
    );
  }
}
