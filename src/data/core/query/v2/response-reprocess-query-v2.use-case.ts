import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { QueryResponseHelper, QueryStackResultAndFailedServices } from 'src/data/core/query/v2/query-response.helper';
import { QueryStatus } from 'src/domain/_entity/query.entity';
import { QueryRequestFailError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import {
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
} from 'src/domain/_layer/infrastructure/service/notification';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { ReprocessInfosDto } from 'src/domain/core/query/v2/response-query.domain';
import {
  ResponseReprocessQueryV2Domain,
  ResponseReprocessQueryV2Errors,
  ResponseReprocessQueryV2IO,
} from 'src/domain/core/query/v2/response-reprocess-query-v2.domain';

@Injectable()
export class ResponseReprocessQueryV2UseCase implements ResponseReprocessQueryV2Domain {
  constructor(
    private readonly _queryRepository: QueryRepository,
    private readonly _queryRequestService: QueryRequestService,
    private readonly _queryResponseHelper: QueryResponseHelper,
    private readonly _userRepository: UserRepository,
    private readonly _notificationService: NotificationServiceGen,
  ) {}

  response(queryResponseDto: QueryResponseDto, reprocessInfos: ReprocessInfosDto): ResponseReprocessQueryV2IO {
    return (
      EitherIO.from(UnknownDomainError.toFn(), async () => this._queryRepository.getById(queryResponseDto.queryRef))
        .map(() => {
          const queryResult: Partial<QueryDto> = this._queryRequestService.parseQueryResponse(
            queryResponseDto,
            reprocessInfos,
          );
          return queryResult;
        })
        .map(async (queryResult: QueryDto) => {
          const { failedServices, stackResult }: QueryStackResultAndFailedServices =
            await this._queryResponseHelper.createStackResultAndFailedServices(queryResponseDto);
          return { ...queryResult, failedServices, stackResult };
        })
        .filter(
          QueryRequestFailError.toFn(),
          ({ queryStatus }: QueryDto) =>
            queryStatus === QueryStatus.SUCCESS || queryStatus === QueryStatus.REPROCESSING,
        )
        .map(async (queryDto: QueryDto) => await this._queryRepository.updateById(queryDto.id, queryDto))
        .map(this._notificateUser(reprocessInfos))
        // .tap(this._requestToAutoReprocess(reprocessInfos))
        .catch(async (error: ResponseReprocessQueryV2Errors) => {
          return Either.left(error);
        })
    );
  }

  private _notificateUser(reprocessInfos: ReprocessInfosDto) {
    return async (queryDto: QueryDto): Promise<void> => {
      const user: UserDto = await this._userRepository.getById(queryDto.userId);

      if (reprocessInfos.status === 'SUCCESS') {
        this._notificationService.dispatch(NotificationTransport.EMAIL, NotificationType.QUERY_AUTO_REPROCESS_SUCCESS, {
          email: user.email,
          name: user.name,
          queryCode: queryDto.queryCode,
          queryId: queryDto.id,
        });
      }
    };
  }
}
