import { Injectable } from '@nestjs/common';
import {
  ReprocessFailedServiceDomain,
  ReprocessFailedServiceIO,
} from '../../../domain/core/query/reprocess-failed-service.domain';
import { QueryHelper } from './query.helper';
import { QueryDto } from '../../../domain/_layer/data/dto/query.dto';
import {
  NoServiceFoundDomainError,
  NoServiceLogFoundDomainError,
  ProviderUnavailableDomainError,
  ServiceLogAlreadyReprocessingDomainError,
  TooManyServiceLogReprocessDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { QueryFailedService, QueryStackResultService } from '../../../domain/_entity/query.entity';
import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ServiceLogDto } from '../../../domain/_layer/data/dto/service-log.dto';
import { DateTimeUtil } from '../../../infrastructure/util/date-time-util.service';
import { ServiceLogRepository } from '../../../domain/_layer/infrastructure/repository/service-log.repository';
import { ServiceLogReprocessing } from '../../../domain/_entity/service-log.entity';
import { QueryProviderService } from '../../../domain/_layer/infrastructure/service/query-provider.service';
import { QueryKeysEntity } from '../../../domain/_entity/query-keys.entity';
import {
  GetProviderDataDto,
  ProviderServiceResponseDto,
  ProviderVehicleData,
} from '../../../domain/_layer/data/dto/get-provider-data.dto';
import { TransactionHelper } from '../../../infrastructure/repository/transaction.helper';
import { QueryRepository } from '../../../domain/_layer/infrastructure/repository/query.repository';

type GetValidServiceLogIO = EitherIO<
  | UnknownDomainError
  | NoServiceLogFoundDomainError
  | TooManyServiceLogReprocessDomainError
  | ServiceLogAlreadyReprocessingDomainError
  | NoServiceFoundDomainError,
  ServiceLogDto
>;

type ValidateServiceIO = EitherIO<UnknownDomainError | NoServiceFoundDomainError, ServiceLogDto>;

type ReprocessFailedDto = {
  readonly queryDto: QueryDto;
  readonly serviceLogDto: ServiceLogDto;
};

@Injectable()
export class ReprocessFailedServiceUseCase implements ReprocessFailedServiceDomain {
  constructor(
    private readonly _queryRepository: QueryRepository,
    private readonly _serviceLogRepository: ServiceLogRepository,
    private readonly _queryProviderService: QueryProviderService,
    private readonly _queryHelper: QueryHelper,
    private readonly _transactionHelper: TransactionHelper,
    private readonly _dateTimeUtil: DateTimeUtil,
  ) {}

  private static _checkIfExistsFailedService(serviceLogId: string): (queryDto: QueryDto) => boolean {
    return (queryDto: QueryDto): boolean => {
      return (
        queryDto.failedServices.filter(
          (failedService: QueryFailedService) => failedService.serviceLogId === serviceLogId,
        ).length > 0
      );
    };
  }

  private static _checkIfNotAlreadyReprocessing(serviceLogDto: ServiceLogDto): boolean {
    return !serviceLogDto.reprocessing?.isReprocessing;
  }

  private static _getSuccessfulServiceResponse(
    serviceResponses: ReadonlyArray<ProviderServiceResponseDto>,
  ): ProviderServiceResponseDto {
    return serviceResponses.find((serviceResponse: ProviderServiceResponseDto) => serviceResponse.isSuccessful);
  }

  private static _getServiceCode(serviceLogDto: ServiceLogDto): number {
    return serviceLogDto.reprocessing?.originalServiceCode || serviceLogDto.serviceCode;
  }

  private static _mergeVehicleIntoResponseJson(
    originalResponse: Record<string, unknown>,
    newResponse: Record<string, unknown>,
  ): Record<string, unknown> {
    return Object.keys(newResponse).reduce((acc: Record<string, unknown>, key: string) => {
      const originalValue: unknown = originalResponse[key];
      const value: unknown = newResponse[key];
      const valueType: string = typeof value;
      const isObject: boolean = valueType === 'object';
      const isNull: boolean = isObject && !value;
      const isUndefined: boolean = valueType === 'undefined';

      if (isNull || isUndefined) return originalValue ? { ...acc, [key]: originalValue } : { ...acc, [key]: value };

      const isDate: boolean = isObject && value instanceof Date;
      const isRegex: boolean = isObject && value instanceof RegExp;
      const isArray: boolean = Array.isArray(value);

      if (!isObject || isDate || isRegex || isArray) return { ...acc, [key]: value };

      return {
        ...acc,
        [key]: ReprocessFailedServiceUseCase._mergeVehicleIntoResponseJson(
          (originalValue as Record<string, unknown>) || {},
          value as Record<string, unknown>,
        ),
      };
    }, {});
  }

  private _checkIfPastAtLeast15Minutes(serviceLogDto: ServiceLogDto): boolean {
    return this._dateTimeUtil.fromIso(serviceLogDto.createdAt).pastAtLeast15Minutes();
  }

  private _checkIfExistsService(serviceLogDto: ServiceLogDto): ValidateServiceIO {
    const serviceCode: number = ReprocessFailedServiceUseCase._getServiceCode(serviceLogDto);
    return this._queryHelper.getByServiceCode(serviceCode).map(() => serviceLogDto);
  }

  private _markServiceLogAsReprocessing(serviceLogDto: ServiceLogDto): Promise<ServiceLogDto> {
    const nextReprocessing: ServiceLogReprocessing = {
      isReprocessing: true,
      attemptsCount: serviceLogDto.reprocessing?.attemptsCount + 1 || 1,
      originalServiceCode: serviceLogDto.reprocessing?.originalServiceCode || serviceLogDto.serviceCode,
      lastRetryAt: this._dateTimeUtil.now().toIso(),
    };
    return this._serviceLogRepository.updateById(serviceLogDto.id, { reprocessing: nextReprocessing });
  }

  private _getValidServiceLog(serviceLogId: string): GetValidServiceLogIO {
    return this._queryHelper
      .getServiceLog(serviceLogId)
      .filter(TooManyServiceLogReprocessDomainError.toFn(), this._checkIfPastAtLeast15Minutes.bind(this))
      .filter(
        ServiceLogAlreadyReprocessingDomainError.toFn(),
        ReprocessFailedServiceUseCase._checkIfNotAlreadyReprocessing,
      )
      .flatMap(this._checkIfExistsService.bind(this))
      .map(this._markServiceLogAsReprocessing.bind(this));
  }

  private async _updateServiceLogFailure(
    dto: ReprocessFailedDto,
    serviceResponseFailures: ReadonlyArray<ProviderServiceResponseDto>,
  ): Promise<ReprocessFailedDto> {
    const rawData: unknown = serviceResponseFailures[0].rawData;
    const error: string = this._queryHelper.rawDataAsString(rawData);
    const nextServiceLog: ServiceLogDto = await this._serviceLogRepository.updateById(dto.serviceLogDto.id, {
      ...dto.serviceLogDto,
      error,
      status: false,
      reprocessing: {
        ...dto.serviceLogDto.reprocessing,
        isReprocessing: false,
      },
    });
    return { ...dto, serviceLogDto: nextServiceLog };
  }

  private _updateQueryWithSuccessfulServiceLog(
    dto: ReprocessFailedDto,
    providerVehicleData: ProviderVehicleData,
    serviceResponseSuccess: ProviderServiceResponseDto,
  ): Promise<QueryDto> {
    const nextFailedServices: ReadonlyArray<QueryFailedService> = dto.queryDto.failedServices.filter(
      (failedService: QueryFailedService) => failedService.serviceLogId !== dto.serviceLogDto.id,
    );
    const stackResultService: QueryStackResultService = this._queryHelper.toStackResult(
      serviceResponseSuccess,
      dto.serviceLogDto,
    );
    const filteredStackResult: ReadonlyArray<QueryStackResultService> = dto.queryDto.stackResult.filter(
      (service: QueryStackResultService) => service.serviceCode !== stackResultService.serviceCode,
    );
    const nextStackResult: ReadonlyArray<QueryStackResultService> = [...filteredStackResult, stackResultService];
    return this._queryRepository.updateById(dto.queryDto.id, {
      failedServices: nextFailedServices,
      stackResult: nextStackResult,
      responseJson: providerVehicleData,
    });
  }

  private async _updateServiceLogSuccess(
    dto: ReprocessFailedDto,
    providerData: GetProviderDataDto,
  ): Promise<ReprocessFailedDto> {
    const serviceResponses: ReadonlyArray<ProviderServiceResponseDto> =
      this._queryHelper.getAllServiceResponses(providerData);
    const serviceResponseSuccess: ProviderServiceResponseDto =
      ReprocessFailedServiceUseCase._getSuccessfulServiceResponse(serviceResponses);
    const nextServiceLogDto: ServiceLogDto = await this._serviceLogRepository.updateById(dto.serviceLogDto.id, {
      ...dto.serviceLogDto,
      error: null,
      serviceCode: serviceResponseSuccess.headerInfos.serviceCode,
      status: true,
      reprocessing: {
        ...dto.serviceLogDto.reprocessing,
        isReprocessing: false,
      },
    });
    const nextQueryDto: QueryDto = await this._updateQueryWithSuccessfulServiceLog(
      dto,
      providerData.vehicle,
      serviceResponseSuccess,
    );
    return { queryDto: nextQueryDto, serviceLogDto: nextServiceLogDto };
  }

  private _rollbackServiceReprocessing(
    serviceLogDto: ServiceLogDto,
  ): (error: ProviderUnavailableDomainError) => Promise<Either<ProviderUnavailableDomainError, ReprocessFailedDto>> {
    return async (
      error: ProviderUnavailableDomainError,
    ): Promise<Either<ProviderUnavailableDomainError, ReprocessFailedDto>> => {
      await this._serviceLogRepository.updateById(serviceLogDto.id, {
        reprocessing: {
          ...serviceLogDto.reprocessing,
          isReprocessing: false,
        },
      });
      return Either.left(error);
    };
  }

  private _reprocessService(dto: ReprocessFailedDto): EitherIO<ProviderUnavailableDomainError, ReprocessFailedDto> {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () => {
      const serviceCodes: ReadonlyArray<number> = [ReprocessFailedServiceUseCase._getServiceCode(dto.serviceLogDto)];
      const queryKeys: QueryKeysEntity = dto.queryDto.queryKeys;
      return this._queryProviderService.processServices(serviceCodes, queryKeys);
    })
      .map((providerData: GetProviderDataDto) => {
        const serviceResponseFailures: ReadonlyArray<ProviderServiceResponseDto> =
          this._queryHelper.getAllServiceResponseFailures(providerData);
        const hasFailures: boolean = serviceResponseFailures.length > 0;
        return hasFailures
          ? this._updateServiceLogFailure(dto, serviceResponseFailures)
          : this._updateServiceLogSuccess(dto, providerData);
      })
      .catch(this._rollbackServiceReprocessing(dto.serviceLogDto));
  }

  reprocessFailedService(queryId: string, serviceLogId: string): ReprocessFailedServiceIO {
    return this._queryHelper
      .getQuery(queryId)
      .filter(
        NoServiceLogFoundDomainError.toFn(),
        ReprocessFailedServiceUseCase._checkIfExistsFailedService(serviceLogId),
      )
      .zip(this._getValidServiceLog(serviceLogId), (queryDto: QueryDto, serviceLogDto: ServiceLogDto) => ({
        queryDto,
        serviceLogDto,
      }))
      .flatMap(this._reprocessService.bind(this))
      .map((dto: ReprocessFailedDto) => dto.serviceLogDto);
  }
}
