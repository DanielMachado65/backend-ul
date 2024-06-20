import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { QueryFailedService, QueryStackResultService, QueryStatus } from 'src/domain/_entity/query.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import {
  ProviderServiceDataQueueDto,
  ProviderStackResultRepsonse,
} from 'src/domain/_layer/data/dto/get-provider-data.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import {
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
} from 'src/domain/_layer/infrastructure/service/notification';
import {
  ProviderDataQueueDto,
  ReprocessQueryQueueDomain,
  ReprocessQueryQueueIO,
} from 'src/domain/core/query/reprocess-query-queue.domain';

@Injectable()
export class ReprocessQueryQueueUseCase implements ReprocessQueryQueueDomain {
  constructor(
    private readonly _queryRepository: QueryRepository,
    private readonly _userRepository: UserRepository,
    private readonly _notificationService: NotificationServiceGen,
  ) {}

  private _mergeFailedServices(response: ProviderDataQueueDto) {
    return (queryDto: QueryDto): QueryDto => {
      const successServiceCodes: ReadonlyArray<number> = response.services
        .filter((service: ProviderServiceDataQueueDto) => service.hasSuccessfulResponse === true)
        .map((service: ProviderServiceDataQueueDto) => service.requestedServiceCode);

      const failedServices: ReadonlyArray<QueryFailedService> = queryDto.failedServices.reduce(
        (prev: ReadonlyArray<QueryFailedService>, curr: QueryFailedService) => {
          const index: number = successServiceCodes.indexOf(curr.serviceCode);

          if (index === -1) {
            return [...prev, curr];
          }

          return prev;
        },
        [] as ReadonlyArray<QueryFailedService>,
      );

      return { ...queryDto, failedServices };
    };
  }

  private _mergeStackResult(response: ProviderDataQueueDto) {
    return (queryDto: QueryDto): QueryDto => {
      const stackResult: ReadonlyArray<QueryStackResultService> = response.services.reduce(
        (prev: ReadonlyArray<unknown>, curr: ProviderServiceDataQueueDto) => {
          const infos: ReadonlyArray<unknown> = curr.responses.map((response: ProviderStackResultRepsonse) => ({
            rawData: response?.rawData,
            serviceCode: response.headerInfos.serviceCode,
            dataFound: response.dataFound,
            hasError: !response.isSuccessful,
            supplierCode: 0,
          }));

          return [...prev, ...infos];
        },
        [] as ReadonlyArray<QueryStackResultService>,
      ) as ReadonlyArray<QueryStackResultService>;

      return { ...queryDto, stackResult: [...queryDto.stackResult, ...stackResult] };
    };
  }

  private _updateQuery(queryId: string, response: ProviderDataQueueDto) {
    return async (queryDto: QueryDto): Promise<QueryDto> => {
      const queryStatus: QueryStatus =
        response.status === 'PROCCESSING' ? QueryStatus.REPROCESSING : QueryStatus.SUCCESS;

      return await this._queryRepository.updateById(queryId, {
        failedServices: queryDto.failedServices,
        stackResult: queryDto.stackResult,
        queryStatus: queryStatus,
        responseJson: {
          ...queryDto.responseJson,
          ...response.vehicle,
        },
      });
    };
  }

  private _notificateUser(response: ProviderDataQueueDto) {
    return async (queryDto: QueryDto): Promise<void> => {
      const user: UserDto = await this._userRepository.getById(queryDto.userId);

      if (response.status === 'SUCCESS') {
        this._notificationService.dispatch(NotificationTransport.EMAIL, NotificationType.QUERY_AUTO_REPROCESS_SUCCESS, {
          email: user.email,
          name: user.name,
          queryCode: queryDto.queryCode,
          queryId: queryDto.id,
        });
      }
    };
  }

  saveLegacyQuery(queryId: string, response: ProviderDataQueueDto): ReprocessQueryQueueIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () => {
      return await this._queryRepository.getById(queryId);
    })
      .map(this._mergeFailedServices(response))
      .map(this._mergeStackResult(response))
      .map(this._updateQuery(queryId, response))
      .map(this._notificateUser(response))
      .catch(Either.left);
  }
}
