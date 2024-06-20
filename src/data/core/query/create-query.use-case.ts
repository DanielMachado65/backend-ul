import { Either, EitherIO, ErrorFn } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { EventEmitterService } from 'src/domain/_layer/infrastructure/service/event/event.service';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { ResponseCreditQueryDomain } from 'src/domain/core/query/credit/response-credit-query.domain';
import { AppEventDispatcher } from 'src/infrastructure/decorators/events.decorator';
import { QueryComposerEntity } from '../../../domain/_entity/query-composer.entity';
import { QueryKeysEntity } from '../../../domain/_entity/query-keys.entity';
import {
  QueryDocumentType,
  QueryEntity,
  QueryFailedService,
  QueryStackResultService,
  QueryStatus,
} from '../../../domain/_entity/query.entity';
import {
  InvalidKeysForProductDomainError,
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  QueryDuplicatedDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { ServiceLogReprocessing } from '../../../domain/_entity/service-log.entity';
import {
  GetProviderDataDto,
  ProviderServiceResponseDto,
  ProviderVehicleData,
} from '../../../domain/_layer/data/dto/get-provider-data.dto';
import { QueryComposerDto } from '../../../domain/_layer/data/dto/query-composer.dto';
import { QueryLogDto } from '../../../domain/_layer/data/dto/query-log.dto';
import { QueryDto } from '../../../domain/_layer/data/dto/query.dto';
import { ServiceLogDto } from '../../../domain/_layer/data/dto/service-log.dto';
import { ServiceDto } from '../../../domain/_layer/data/dto/service.dto';
import { UserDto } from '../../../domain/_layer/data/dto/user.dto';
import { QueryLogRepository } from '../../../domain/_layer/infrastructure/repository/query-log.repository';
import { QueryRepository } from '../../../domain/_layer/infrastructure/repository/query.repository';
import { ServiceLogRepository } from '../../../domain/_layer/infrastructure/repository/service-log.repository';
import { UserRepository } from '../../../domain/_layer/infrastructure/repository/user.repository';
import { QueryProviderService } from '../../../domain/_layer/infrastructure/service/query-provider.service';
import {
  CreateQueryDomain,
  CreateQueryDomainErrors,
  CreateQueryIO,
} from '../../../domain/core/query/create-query.domain';
import { GetQueryComposerDomain } from '../../../domain/core/query/get-query-composer.domain';
import {
  GetServicesFromQueryComposerDomain,
  GetServicesFromQueryComposerDomainErrors,
} from '../../../domain/core/query/get-services-from-query-composer.domain';
import { DateTime, DateTimeUtil } from '../../../infrastructure/util/date-time-util.service';
import { QueryHelper } from './query.helper';

export type CreateQueryProviderResultData = {
  readonly result: QueryStackResultService;
  readonly failure: Partial<QueryFailedService>;
};

export type CreateQueryProviderData = {
  readonly stackResult: ReadonlyArray<QueryStackResultService>;
  readonly failedServices: ReadonlyArray<Partial<QueryFailedService>>;
};

export type CreateQueryData = {
  readonly queryDto: QueryDto;
  readonly queryLogDto: QueryLogDto;
  readonly queryComposerDto: QueryComposerDto;
  readonly servicesDto: ReadonlyArray<ServiceDto>;
  readonly providerDto: GetProviderDataDto;
  readonly stackResult: ReadonlyArray<QueryStackResultService>;
  readonly failedServices: ReadonlyArray<Partial<QueryFailedService>>;
};

type DocumentQueryValues = { readonly documentQuery: string; readonly documentType: QueryDocumentType };

type QueryDuplicatedIO = EitherIO<UnknownDomainError | QueryDuplicatedDomainError, QueryComposerEntity>;

@Injectable()
export class CreateQueryUseCase implements CreateQueryDomain {
  private readonly _defaultCep: string = '01015100';

  constructor(
    private readonly _getQueryComposerDomain: GetQueryComposerDomain,
    private readonly _getServicesFromQueryComposerDomain: GetServicesFromQueryComposerDomain,
    private readonly _queryRepository: QueryRepository,
    private readonly _queryLogRepository: QueryLogRepository,
    private readonly _serviceLogRepository: ServiceLogRepository,
    private readonly _userRepository: UserRepository,
    private readonly _queryService: QueryProviderService,
    private readonly _queryHelper: QueryHelper,
    private readonly _dateTimeUtil: DateTimeUtil,
    private readonly _queryRequestService: QueryRequestService,
    private readonly _responseCreditQueryDomain: ResponseCreditQueryDomain,
    @AppEventDispatcher() private readonly _eventEmitterService: EventEmitterService,
  ) {}

  private static _prettifyErrorMsg(error: CreateQueryDomainErrors): string {
    try {
      type InternalDetails = {
        readonly name: string;
        readonly message: string;
        readonly stackTrace: string;
      };

      const internalDetails: InternalDetails = error.internalDetails as unknown as InternalDetails;

      const tag: string = error.tag;
      const description: string = error.description;
      const entrypoint: string =
        internalDetails?.stackTrace
          ?.split(/\r?\n|\r|\n/g)
          ?.filter((text: string) => typeof text === 'string')
          ?.map((text: string) => text.trim())
          ?.find((text: string) => text.startsWith('at')) ||
        internalDetails?.stackTrace ||
        'unknown';

      return JSON.stringify({ tag, description, entrypoint });
    } catch (_error) {
      return 'unknown error';
    }
  }

  private static _checkIfIsValidUser(user: UserDto): boolean {
    return typeof user === 'object' && user !== null && user.status;
  }

  private static _checkIfProviderIsAvailable({
    providerDto,
    stackResult,
    failedServices,
  }: Partial<CreateQueryData>): boolean {
    const hasProviderResponse: boolean = !!providerDto;
    const hasStackResult: boolean = Array.isArray(stackResult) && stackResult.length > 0;
    const isValidFailedServices: boolean = Array.isArray(failedServices);
    const hasVehicle: boolean = Object.keys(providerDto.vehicle).length > 0;
    const hasAnySuccessfulResult: boolean = stackResult.some(
      (result: QueryStackResultService) => !result.hasError && result.serviceCode !== 1,
    );
    const hasNoDataFound: boolean = stackResult.every((result: QueryStackResultService) => !result.dataFound);
    const hasResponseJson: boolean = hasVehicle || (hasAnySuccessfulResult && hasNoDataFound);
    return hasProviderResponse && hasStackResult && isValidFailedServices && hasResponseJson;
  }

  private async _getDuplicatedQuery(
    userId: string,
    queryCode: number,
    keys: QueryKeysEntity,
    mayDuplicate: boolean,
  ): Promise<QueryDto | null> {
    if (mayDuplicate) return null;
    const lastDay: DateTime = this._dateTimeUtil.now().subtract(1, 'day');
    const last5Minutes: DateTime = this._dateTimeUtil.now().subtract(5, 'minute');
    return this._queryRepository.getDuplicatedQuery(userId, queryCode, keys, lastDay, last5Minutes);
  }

  private async _createStackResultAndFailedServices(
    serviceResponses: ReadonlyArray<ProviderServiceResponseDto>,
    serviceResponseFailures: ReadonlyArray<ProviderServiceResponseDto>,
    queryLogDto: QueryLogDto,
  ): Promise<CreateQueryProviderData> {
    const promises: ReadonlyArray<Promise<CreateQueryProviderResultData>> = serviceResponses
      .filter((serviceResponse: ProviderServiceResponseDto) => !!serviceResponse?.headerInfos?.serviceCode)
      .map(async (serviceResponse: ProviderServiceResponseDto) => {
        const isFailedService: boolean = serviceResponseFailures.some((failure: ProviderServiceResponseDto) => {
          return failure.headerInfos.serviceCode === serviceResponse.headerInfos.serviceCode;
        });
        const logId: string = queryLogDto.id;
        const serviceCode: number = serviceResponse.headerInfos.serviceCode;
        const reprocessing: ServiceLogReprocessing = {
          isReprocessing: false,
          attemptsCount: 0,
          lastRetryAt: this._dateTimeUtil.now().toIso(),
          originalServiceCode: serviceCode,
        };
        const dto: Partial<ServiceLogDto> = isFailedService
          ? {
              logId,
              serviceCode,
              reprocessing,
              status: false,
              error: this._queryHelper.rawDataAsString(serviceResponse.rawData),
            }
          : { logId, serviceCode, reprocessing, status: true, error: '' };
        const serviceLogDto: ServiceLogDto = await this._serviceLogRepository.insert(dto);
        const result: QueryStackResultService = this._queryHelper.toStackResult(serviceResponse, serviceLogDto);
        const failure: Partial<QueryFailedService> = isFailedService
          ? this._queryHelper.toFailedService(serviceResponse, serviceLogDto)
          : null;
        return { result, failure };
      });
    const values: ReadonlyArray<CreateQueryProviderResultData> = await Promise.all(promises);
    return values.reduce(
      (acc: CreateQueryProviderData, value: CreateQueryProviderResultData) => {
        return value.failure
          ? {
              stackResult: [...acc.stackResult, value.result],
              failedServices: [...acc.failedServices, value.failure],
            }
          : { ...acc, stackResult: [...acc.stackResult, value.result] };
      },
      { stackResult: [], failedServices: [] },
    );
  }

  private _createDocumentQuery(queryKeys: QueryKeysEntity): DocumentQueryValues {
    if ('plate' in queryKeys && !!queryKeys.plate) {
      return { documentQuery: queryKeys.plate, documentType: QueryDocumentType.PLATE };
    } else if ('chassis' in queryKeys && !!queryKeys.chassis) {
      return { documentQuery: queryKeys.chassis, documentType: QueryDocumentType.CHASSIS };
    } else if ('engine' in queryKeys && !!queryKeys.engine) {
      return { documentQuery: queryKeys.engine, documentType: QueryDocumentType.ENGINE };
    } else if ('cpf' in queryKeys && !!queryKeys.cpf) {
      return { documentQuery: queryKeys.cpf, documentType: QueryDocumentType.CPF };
    } else if ('cnpj' in queryKeys && !!queryKeys.cnpj) {
      return { documentQuery: queryKeys.cnpj, documentType: QueryDocumentType.CNPJ };
    }

    throw new InvalidKeysForProductDomainError();
  }

  private _newQuery(
    userId: string,
    queryKeys: QueryKeysEntity,
  ): (queryComposerDto: QueryComposerDto) => Promise<Partial<CreateQueryData>> {
    return async (queryComposerDto: QueryComposerDto): Promise<Partial<CreateQueryData>> => {
      const { documentQuery, documentType }: DocumentQueryValues = this._createDocumentQuery(queryKeys);
      const preQueryDto: QueryDto = await this._queryRepository.insert({
        userId,
        documentQuery,
        documentType,
        queryKeys,
        queryCode: queryComposerDto.queryCode,
        refClass: queryComposerDto.name,
      });
      const queryLogDto: QueryLogDto = await this._queryLogRepository.insert({
        queryId: preQueryDto.id,
        userId: userId,
      });
      const queryDto: QueryDto = await this._queryRepository.updateById(preQueryDto.id, {
        ...preQueryDto,
        logId: queryLogDto.id,
      });
      return { queryDto, queryLogDto, queryComposerDto };
    };
  }

  private _getServices(
    createQueryDto: Partial<CreateQueryData>,
  ): EitherIO<GetServicesFromQueryComposerDomainErrors, Partial<CreateQueryData>> {
    const queryComposerId: string = createQueryDto.queryComposerDto?.id;
    return this._getServicesFromQueryComposerDomain
      .getServicesFromQueryComposer(queryComposerId)
      .map((servicesDto: ReadonlyArray<ServiceDto>) => ({
        ...createQueryDto,
        servicesDto,
      }));
  }

  private _retrieveProviderData(
    queryKeys: QueryKeysEntity,
  ): (createQueryDto: Partial<CreateQueryData>) => EitherIO<ProviderUnavailableDomainError, Partial<CreateQueryData>> {
    return (
      createQueryDto: Partial<CreateQueryData>,
    ): EitherIO<ProviderUnavailableDomainError, Partial<CreateQueryData>> => {
      return EitherIO.from(ProviderUnavailableDomainError.toFn(), async () => {
        const { queryLogDto, servicesDto = [] }: Partial<CreateQueryData> = createQueryDto;
        const correlationId: string = createQueryDto?.queryDto?.id;
        const serviceCodes: ReadonlyArray<number> = servicesDto.map((service: ServiceDto) => service.code);
        const providerDto: GetProviderDataDto = await this._queryService.processServices(
          serviceCodes,
          queryKeys,
          correlationId,
        );
        const serviceResponses: ReadonlyArray<ProviderServiceResponseDto> =
          this._queryHelper.getAllServiceResponses(providerDto);
        const serviceResponseFailures: ReadonlyArray<ProviderServiceResponseDto> =
          this._queryHelper.getAllServiceResponseFailures(providerDto);
        const { stackResult, failedServices }: CreateQueryProviderData = await this._createStackResultAndFailedServices(
          serviceResponses,
          serviceResponseFailures,
          queryLogDto,
        );
        return { ...createQueryDto, providerDto, stackResult, failedServices };
      });
    };
  }

  private _updateStackResultToQuery() {
    return async (createQueryDto: Partial<CreateQueryData>): Promise<void> => {
      const stackResult: ReadonlyArray<QueryStackResultService> = createQueryDto.stackResult;
      await this._queryRepository.updateById(createQueryDto.queryDto.id, { stackResult });
    };
  }

  private _updateQuery(startTime: DateTime): (createQueryDto: Partial<CreateQueryData>) => Promise<QueryDto> {
    return (createQueryDto: Partial<CreateQueryData>): Promise<QueryDto> => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { stackResult, ...queryDto }: QueryDto = createQueryDto.queryDto;
      const failedServices: ReadonlyArray<QueryFailedService> =
        createQueryDto.failedServices as ReadonlyArray<QueryFailedService>;
      const vehicle: Record<string, unknown> = createQueryDto.providerDto?.vehicle || {};
      const responseJson: ProviderVehicleData = Object.keys(vehicle).length > 0 ? vehicle : null;
      const executionTime: number = this._dateTimeUtil.now().diff(startTime) / 1000;
      return this._queryRepository.updateById(queryDto.id, {
        ...queryDto,
        status: QueryStatus.SUCCESS,
        failedServices,
        responseJson,
        executionTime,
      });
    };
  }

  private _gracefullyHandleErrorQuery(
    queryId: string,
    startTime: DateTime,
  ): (error: CreateQueryDomainErrors) => Promise<Either<UnknownDomainError, QueryEntity>> {
    return async (error: CreateQueryDomainErrors): Promise<Either<UnknownDomainError, QueryEntity>> => {
      const executionTime: number = this._dateTimeUtil.now().diff(startTime) / 1000;
      await this._queryRepository.updateById(queryId, { status: QueryStatus.FAILURE, executionTime });
      await this._queryLogRepository.updateByQueryId(queryId, {
        status: false,
        errorMessage: CreateQueryUseCase._prettifyErrorMsg(error),
      });
      return Either.left(error);
    };
  }

  private _processQuery(
    queryKeys: QueryKeysEntity,
    startTime: DateTime,
  ): (createQueryData: Partial<CreateQueryData>) => CreateQueryIO {
    return (createQueryData: Partial<CreateQueryData>): CreateQueryIO => {
      if (createQueryData.queryComposerDto.queryCode === 27) {
        return EitherIO.from(UnknownDomainError.toFn(), () => createQueryData.queryDto.id)
          .tap(this._requestQueryV2(queryKeys))
          .map(async (queryId: string) => await this._queryRequestService.getAsyncQueryByReference(queryId))
          .flatMap((queryDto: QueryResponseDto) => this._responseCreditQueryDomain.responseQuery(queryDto, true));
      }

      return this._getServices(createQueryData)
        .flatMap(this._retrieveProviderData(queryKeys))
        .tap(this._updateStackResultToQuery())
        .filter(ProviderUnavailableDomainError.toFn(), CreateQueryUseCase._checkIfProviderIsAvailable)
        .map(this._updateQuery(startTime))
        .catch(this._gracefullyHandleErrorQuery(createQueryData?.queryDto?.id, startTime));
    };
  }

  private _requestQueryV2(queryKeys: QueryKeysEntity) {
    return async (queryId: string): Promise<void> => {
      const templateQueryRef: string = '27';
      await this._queryRequestService.requestQuery({
        queryRef: queryId,
        keys: queryKeys,
        templateQueryRef: templateQueryRef,
        support: {
          userEmail: '',
          userName: '',
        },
      });
    };
  }

  private _checkIfDuplicatedQuery(
    userId: string,
    queryCode: number,
    keys: QueryKeysEntity,
    mayDuplicate: boolean,
  ): (queryComposerDto: QueryComposerDto) => QueryDuplicatedIO {
    return (queryComposerDto: QueryComposerDto): QueryDuplicatedIO => {
      return EitherIO.from(UnknownDomainError.toFn(), () =>
        this._getDuplicatedQuery(userId, queryCode, keys, mayDuplicate),
      ).flatMap((maybeQuery: QueryDto | null, errorFn: ErrorFn<UnknownDomainError>) => {
        return maybeQuery
          ? EitherIO.raise(
              QueryDuplicatedDomainError.toFn({
                queryId: maybeQuery.id,
                code: maybeQuery.queryCode,
                name: maybeQuery.refClass,
                createdAt: maybeQuery.createdAt,
              }),
            )
          : EitherIO.of(errorFn, queryComposerDto);
      });
    };
  }

  private async _enrichQueryKeys(user: UserDto, queryKeys: QueryKeysEntity): Promise<QueryKeysEntity> {
    const zipCode: string = user?.address?.zipCode || this._defaultCep;
    return { zipCode, ...queryKeys };
  }

  private _fromUser(userId: string): EitherIO<UnknownDomainError | NoUserFoundDomainError, UserDto> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(userId)).filter(
      NoUserFoundDomainError.toFn(),
      CreateQueryUseCase._checkIfIsValidUser,
    );
  }

  createQuery(userId: string, queryCode: number, queryKeys: QueryKeysEntity, mayDuplicate: boolean): CreateQueryIO {
    const startTime: DateTime = this._dateTimeUtil.now();

    return this._fromUser(userId)
      .map((user: UserDto) => this._enrichQueryKeys(user, queryKeys))
      .flatMap((nextQueryKeys: QueryKeysEntity) => {
        return this._getQueryComposerDomain
          .getQueryComposer(userId, queryCode)
          .flatMap(this._checkIfDuplicatedQuery(userId, queryCode, nextQueryKeys, mayDuplicate))
          .map(this._newQuery(userId, nextQueryKeys))
          .flatMap(this._processQuery(nextQueryKeys, startTime))
          .tap((query: QueryDto) =>
            this._eventEmitterService.dispatchQuerySucceeded({
              queryId: query.id,
              keys: query.queryKeys,
              userId: query.userId,
            }),
          );
      });
  }
}
