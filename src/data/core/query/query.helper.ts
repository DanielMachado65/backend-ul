import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { ClientType } from '../../../domain/_entity/client.entity';
import { QueryParsedData, QueryRepresentationEntity } from '../../../domain/_entity/query-representation.entity';
import { QueryFailedService, QueryStackResultService } from '../../../domain/_entity/query.entity';
import {
  NoQueryFoundDomainError,
  NoServiceFoundDomainError,
  NoServiceLogFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import {
  GetProviderDataDto,
  ProviderServiceDataDto,
  ProviderServiceResponseDto,
} from '../../../domain/_layer/data/dto/get-provider-data.dto';
import { QueryDto } from '../../../domain/_layer/data/dto/query.dto';
import { ServiceLogDto } from '../../../domain/_layer/data/dto/service-log.dto';
import { ServiceDto } from '../../../domain/_layer/data/dto/service.dto';
import { QueryRepository } from '../../../domain/_layer/infrastructure/repository/query.repository';
import { ServiceLogRepository } from '../../../domain/_layer/infrastructure/repository/service-log.repository';
import { ServiceRepository } from '../../../domain/_layer/infrastructure/repository/service.repository';
import { QueryParserService } from '../../../domain/_layer/infrastructure/service/query-parser.service';
import { GetQueryIO } from '../../../domain/core/query/get-query.domain';

@Injectable()
export class QueryHelper {
  constructor(
    private readonly _queryRepository: QueryRepository,
    private readonly _serviceRepository: ServiceRepository,
    private readonly _serviceLogRepository: ServiceLogRepository,
    private readonly _queryParserService: QueryParserService,
  ) {}

  private static _parseQueryDtoToQueryRepresentation(
    queryDto: QueryDto,
  ): (queryParsedData: QueryParsedData) => QueryRepresentationEntity {
    return (queryParsedData: QueryParsedData): QueryRepresentationEntity => {
      return {
        id: queryDto.id,
        code: queryDto.queryCode,
        name: queryDto.refClass,
        plate: queryDto.responseJson?.placa as string,
        brandAndModel: queryDto.responseJson?.marcaModelo as string,
        brandImageUrl: queryDto.responseJson?.marcaImagem as string,
        createdAt: queryDto.createdAt,
        keys: queryDto.queryKeys,
        dsl: queryParsedData,
        failedServices: queryDto.failedServices,
        status: queryDto.status,
        queryStatus: queryDto.queryStatus,
        version: queryDto.version,
        rules: queryDto.rules,
      };
    };
  }

  private static _filterDelicateFields() {
    return (queryDto: QueryDto): QueryDto => {
      const failedServices: ReadonlyArray<QueryFailedService> = queryDto.failedServices.map(
        (failedService: QueryFailedService) => ({
          serviceLogId: failedService.serviceLogId,
          serviceCode: failedService.serviceCode,
          serviceName: failedService.serviceName,
          supplierCode: failedService.supplierCode,
          amountToRetry: failedService.amountToRetry,
          lastRetryAt: failedService.lastRetryAt,
        }),
      );

      return {
        ...queryDto,
        failedServices: failedServices,
      };
    };
  }

  getAllServiceResponses(providerData: GetProviderDataDto): ReadonlyArray<ProviderServiceResponseDto> {
    return (
      providerData?.services?.flatMap((service: ProviderServiceDataDto) => [
        service.requestedResponse,
        ...service.fallbackResponses,
      ]) || []
    );
  }

  toStackResult(response: ProviderServiceResponseDto, serviceLogDto: ServiceLogDto): QueryStackResultService {
    return {
      rawData: response.rawData,
      serviceLogId: serviceLogDto.id,
      serviceCode: serviceLogDto.serviceCode,
      dataFound: response.dataFound,
      hasError: !response.isSuccessful,
      supplierCode: response.headerInfos.supplierCode,
    };
  }

  toFailedService(response: ProviderServiceResponseDto, serviceLogDto: ServiceLogDto): Partial<QueryFailedService> {
    return {
      serviceLogId: serviceLogDto.id,
      serviceCode: serviceLogDto.serviceCode,
      serviceName: response.headerInfos.serviceName,
      supplierCode: response.headerInfos.supplierCode,
    };
  }

  rawDataAsString(rawData: unknown): string {
    return typeof rawData === 'object' && rawData
      ? JSON.stringify(rawData)
      : typeof rawData === 'string'
      ? rawData
      : '';
  }

  getAllServiceResponseFailures(providerData: GetProviderDataDto): ReadonlyArray<ProviderServiceResponseDto> {
    return providerData.services
      .filter((service: ProviderServiceDataDto) => !service.isSuccessfulGroup)
      .map((service: ProviderServiceDataDto) => service.requestedResponse);
  }

  getQuery(queryId: string): GetQueryIO {
    return EitherIO.of(UnknownDomainError.toFn(), queryId)
      .map((id: string) => this._queryRepository.getById(id))
      .map(QueryHelper._filterDelicateFields())
      .filter(NoQueryFoundDomainError.toFn(), (queryDto: QueryDto) => !!queryDto);
  }

  getService(serviceId: string): EitherIO<NoServiceFoundDomainError, ServiceDto> {
    return EitherIO.of(UnknownDomainError.toFn(), serviceId)
      .map((id: string) => this._serviceRepository.getById(id))
      .filter(NoServiceFoundDomainError.toFn(), (serviceDto: ServiceDto) => !!serviceDto);
  }

  getByServiceCode(serviceCode: number): EitherIO<NoServiceFoundDomainError, ServiceDto> {
    return EitherIO.of(UnknownDomainError.toFn(), serviceCode)
      .map((code: number) => this._serviceRepository.getByServiceCode(code))
      .filter(NoServiceFoundDomainError.toFn(), (serviceDto: ServiceDto) => !!serviceDto);
  }

  getServiceLog(serviceLogId: string): EitherIO<NoServiceLogFoundDomainError, ServiceLogDto> {
    return EitherIO.of(UnknownDomainError.toFn(), serviceLogId)
      .map((id: string) => this._serviceLogRepository.getById(id))
      .filter(NoServiceLogFoundDomainError.toFn(), (serviceLogDto: ServiceLogDto) => !!serviceLogDto);
  }

  getQueryRepresentation(
    queryDto: QueryDto,
    clientType: ClientType,
  ): EitherIO<ProviderUnavailableDomainError, QueryRepresentationEntity> {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () => {
      return queryDto.responseJson !== null
        ? this._queryParserService.parseQuery(queryDto.queryCode, clientType, queryDto.responseJson)
        : null;
    }).map(QueryHelper._parseQueryDtoToQueryRepresentation(queryDto));
  }

  getQueryRepresentationV2(
    queryDto: QueryDto,
    clientType: ClientType,
  ): EitherIO<ProviderUnavailableDomainError, QueryRepresentationEntity> {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () => {
      const shouldParseQuery: boolean = queryDto.responseJson !== null;

      return shouldParseQuery
        ? this._queryParserService.parseQuery(queryDto.queryCode, clientType, queryDto.responseJson)
        : null;
    }).map(QueryHelper._parseQueryDtoToQueryRepresentation(queryDto));
  }
}
