import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PreQueryEntity } from 'src/domain/_entity/pre-query.entity';
import { QueryComposerEntity } from 'src/domain/_entity/query-composer.entity';
import { QueryConfirmationEntity } from 'src/domain/_entity/query-confirmation.entity';
import { QueryRepresentationWithPopUpEntity } from 'src/domain/_entity/query-representation.entity';
import { QueryEntity } from 'src/domain/_entity/query.entity';
import {
  CantIssueInvoiceDomainError,
  InactiveBillingDomainError,
  InsufficientCreditsDomainError,
  InvalidKeysForProductDomainError,
  NoPriceTableFoundDomainError,
  NoQueryFoundDomainError,
  NoUserFoundDomainError,
  ProductUnavailableToUserDomainError,
  ProviderUnavailableDomainError,
  QueryDuplicatedDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { ServiceEntity } from 'src/domain/_entity/service.entity';
import { VehicleInformationsEntity } from 'src/domain/_entity/vehicle-informations.entity';
import { QueryKeysDto } from 'src/domain/_layer/data/dto/query-keys.dto';
import { PaginationInputDto } from 'src/domain/_layer/presentation/dto/pagination-input.dto';
import { PreQueryInputDto } from 'src/domain/_layer/presentation/dto/pre-query-input.dto';
import { ReprocessQueryInputDto } from 'src/domain/_layer/presentation/dto/reprocess-query-input.dto';
import { SearchHistoryDto } from 'src/domain/_layer/presentation/dto/search-query-hisotry.dto';
import { GetPreQueryDomain, GetPreQueryResult } from 'src/domain/core/query/get-pre-query.domain';
import {
  GetQueryConfirmationDomain,
  QueryConfirmationResult,
} from 'src/domain/core/query/get-query-confirmation.domain';
import { GetQueryHistory, GetQueryHistoryDomain } from 'src/domain/core/query/get-query-history.domain';
import {
  GetVehicleInformationsDomain,
  GetVehicleInformationsResult,
} from 'src/domain/core/query/get-vehicle-informations.domain';
import {
  ResquestAutoReprocessQueryDomain,
  ResquestAutoReprocessQueryResult,
} from 'src/domain/core/query/request-auto-reprocess-query.domain';
import { GetAlreadyDoneQueryV2Domain } from 'src/domain/core/query/v2/get-already-done-query-v2.domain';
import {
  ReplaceFailedServicesDomain,
  ReplaceFailedServicesResult,
} from 'src/domain/core/query/v2/replace-failed-services.domain';
import { ReprocessQueryDomain, ReprocessQueryResult } from 'src/domain/core/query/v2/reprocess-query.domain';
import { RequestQueryV2Domain, RequestQueryV2Result } from 'src/domain/core/query/v2/request-query-v2.domain';
import { UseUtilizationLog } from 'src/infrastructure/decorators/log-utilization.decorator';
import { ApiError } from 'src/infrastructure/framework/swagger/schemas/error.schema';
import { ApiList } from 'src/infrastructure/framework/swagger/schemas/list.schema';
import { ApiPagination } from 'src/infrastructure/framework/swagger/schemas/pagination.schema';
import { ApiErrorResponseMake, ApiOkResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import {
  NoBalanceFoundDomainError,
  NoProductFoundDomainError,
  QueryDuplicatedDomainErrorDetails,
} from '../../../domain/_entity/result.error';
import { QueryHistoryItemDto } from '../../../domain/_layer/data/dto/query-history-item.dto';
import { CreateQueryInputDto } from '../../../domain/_layer/presentation/dto/create-query-input.dto';
import {
  GetAlreadyParamInputDto,
  GetAlreadyQueryInputDto,
} from '../../../domain/_layer/presentation/dto/get-already-done-query-input.dto';
import { GetQueryComposerInputDto } from '../../../domain/_layer/presentation/dto/get-query-composer-input.dto';
import { GetQueryInputDto } from '../../../domain/_layer/presentation/dto/get-query-input.dto';
import { GetServicesFromQueryComposerInputDto } from '../../../domain/_layer/presentation/dto/get-services-from-query-composer-input.dto';
import { ReprocessFailedServiceInputDto } from '../../../domain/_layer/presentation/dto/reprocess-failed-service-input.dto';
import {
  ReplaceFailedServicesInputDto,
  RequestQueryInputDto,
} from '../../../domain/_layer/presentation/dto/request-query-input.dto';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';
import { CreateQueryDomain, CreateQueryResult } from '../../../domain/core/query/create-query.domain';
import {
  GetAlreadyDoneQueryDomain,
  GetAlreadyDoneQueryResult,
} from '../../../domain/core/query/get-already-done-query.domain';
import { GetQueryComposerDomain, GetQueryComposerResult } from '../../../domain/core/query/get-query-composer.domain';
import { GetQueryDomain, GetQueryResult } from '../../../domain/core/query/get-query.domain';
import {
  GetServicesFromQueryComposerDomain,
  GetServicesFromQueryComposerResult,
} from '../../../domain/core/query/get-services-from-query-composer.domain';
import {
  ReprocessFailedServiceDomain,
  ReprocessFailedServiceResult,
} from '../../../domain/core/query/reprocess-failed-service.domain';
import { RequestQueryDomain, RequestQueryResult } from '../../../domain/core/query/request-query.domain';
import { Roles } from '../../../infrastructure/guard/roles.guard';
import { UserInfo } from '../../../infrastructure/middleware/user-info.middleware';

@ApiBearerAuth()
@ApiTags('Consulta')
@Controller('query')
export class QueryController {
  constructor(
    private readonly _createQueryDomain: CreateQueryDomain,
    private readonly _getAlreadyDoneQueryDomain: GetAlreadyDoneQueryDomain,
    private readonly _getQueryComposerDomain: GetQueryComposerDomain,
    private readonly _getQueryDomain: GetQueryDomain,
    private readonly _getServicesFromQueryComposerDomain: GetServicesFromQueryComposerDomain,
    private readonly _requestQueryDomain: RequestQueryDomain,
    private readonly _requestQueryV2Domain: RequestQueryV2Domain,
    private readonly _reprocessFailedServiceDomain: ReprocessFailedServiceDomain,
    private readonly _getQueryHistoryDomain: GetQueryHistoryDomain,
    private readonly _getQueryConfirmationDomain: GetQueryConfirmationDomain,
    private readonly _reprocessQuery: ReprocessQueryDomain,
    private readonly _getAlreadyDoneQueryV2Domain: GetAlreadyDoneQueryV2Domain,
    private readonly _resquestAutoReprocessQueryDomain: ResquestAutoReprocessQueryDomain,
    private readonly _replaceFailedServicesDomain: ReplaceFailedServicesDomain,
    private readonly _getPreQueryDomain: GetPreQueryDomain,
    private readonly _getVehicleInformationsDomain: GetVehicleInformationsDomain,
  ) {}

  @Get('/history')
  @ApiOperation({ summary: 'list query history' })
  @ApiOkResponseMake(ApiPagination(QueryHistoryItemDto))
  @ApiErrorResponseMake([UnknownDomainError, NoUserFoundDomainError])
  @Roles([UserRoles.REGULAR])
  @UseUtilizationLog('Acesso ao histórico de consultas', 'Usuário acessou o histórico de consultas')
  getHistory(
    @UserInfo() userInfo: UserInfo,
    @Query() { page, perPage }: PaginationInputDto,
    @Query() { search }: SearchHistoryDto,
  ): Promise<GetQueryHistory> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getQueryHistoryDomain.getQueryHistory(userId, perPage, page, search).safeRun();
  }

  @Get('/query-composer/by-code/:queryCode')
  @ApiOperation({ summary: 'return query composer' })
  @ApiExcludeEndpoint()
  @ApiOkResponseMake(QueryComposerEntity)
  @ApiErrorResponseMake([UnknownDomainError, NoUserFoundDomainError, NoProductFoundDomainError])
  @Roles([UserRoles.ADMIN])
  getQueryComposerIfAvailable(
    @UserInfo() userInfo: UserInfo,
    @Param() inputDto: GetQueryComposerInputDto,
  ): Promise<GetQueryComposerResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getQueryComposerDomain.getQueryComposer(userId, inputDto.queryCode).safeRun();
  }

  @Get('/:queryComposer/services')
  @ApiOperation({ summary: 'return services from query composer' })
  @ApiExcludeEndpoint()
  @ApiOkResponseMake(ApiList(ServiceEntity))
  @ApiErrorResponseMake([UnknownDomainError, NoUserFoundDomainError])
  @Roles([UserRoles.ADMIN])
  getServicesFromQueryComposer(
    @Param() inputDto: GetServicesFromQueryComposerInputDto,
  ): Promise<GetServicesFromQueryComposerResult> {
    return this._getServicesFromQueryComposerDomain.getServicesFromQueryComposer(inputDto.queryComposer).safeRun();
  }

  @Post('/')
  @ApiOperation({ summary: 'create a query' })
  @ApiExcludeEndpoint()
  @ApiOkResponseMake(QueryEntity)
  @ApiErrorResponseMake([
    UnknownDomainError,
    NoUserFoundDomainError,
    NoProductFoundDomainError,
    InvalidKeysForProductDomainError,
    ProviderUnavailableDomainError,
  ])
  @Roles([UserRoles.ADMIN])
  createQuery(@UserInfo() userInfo: UserInfo, @Body() inputDto: CreateQueryInputDto): Promise<CreateQueryResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._createQueryDomain
      .createQuery(userId, inputDto.queryCode, inputDto.queryKeys, inputDto.mayDuplicate)
      .safeRun();
  }

  @Get('/representation/:queryId')
  @ApiOperation({ summary: 'return a finished query' })
  @ApiOkResponseMake(QueryRepresentationWithPopUpEntity)
  @ApiErrorResponseMake([UnknownDomainError, NoQueryFoundDomainError, ProviderUnavailableDomainError])
  @Roles([UserRoles.GUEST, UserRoles.REGULAR, UserRoles.ADMIN])
  getAlreadyDoneQuery(
    @Param() inputParams: GetAlreadyParamInputDto,
    @Query() inputQuery: GetAlreadyQueryInputDto,
  ): Promise<GetAlreadyDoneQueryResult> {
    return this._getAlreadyDoneQueryDomain.getAlreadyDoneQuery(inputParams.queryId, inputQuery.clientType).safeRun();
  }

  @Get('/v2/representation/:queryId')
  @ApiOperation({ summary: 'return a finished query version 2' })
  @ApiOkResponseMake(QueryRepresentationWithPopUpEntity)
  @ApiErrorResponseMake([UnknownDomainError, NoQueryFoundDomainError, ProviderUnavailableDomainError])
  @Roles([UserRoles.GUEST, UserRoles.REGULAR, UserRoles.ADMIN])
  getAlreadyDoneQueryV2(
    @Param() inputParams: GetAlreadyParamInputDto,
    @Query() inputQuery: GetAlreadyQueryInputDto,
  ): Promise<GetAlreadyDoneQueryResult> {
    return this._getAlreadyDoneQueryV2Domain.getAlreadyDoneQuery(inputParams.queryId, inputQuery.clientType).safeRun();
  }

  @Get('/created/:queryId')
  @ApiOperation({ summary: 'return a finished query version 2' })
  @ApiOkResponseMake(QueryRepresentationWithPopUpEntity)
  @ApiErrorResponseMake([UnknownDomainError, NoQueryFoundDomainError, ProviderUnavailableDomainError])
  @Roles([UserRoles.GUEST, UserRoles.REGULAR, UserRoles.ADMIN])
  getMakedAlreadyDoneQueryV2(
    @Param() inputParams: GetAlreadyParamInputDto,
    @Query() inputQuery: GetAlreadyQueryInputDto,
  ): Promise<GetAlreadyDoneQueryResult> {
    return this._getAlreadyDoneQueryV2Domain.getAlreadyDoneQuery(inputParams.queryId, inputQuery.clientType).safeRun();
  }

  @Post('/representation')
  @ApiOperation({ summary: 'request a query' })
  @ApiOkResponseMake(QueryRepresentationWithPopUpEntity)
  @ApiErrorResponseMake([
    UnknownDomainError,
    NoPriceTableFoundDomainError,
    NoUserFoundDomainError,
    InactiveBillingDomainError,
    ProductUnavailableToUserDomainError,
    InsufficientCreditsDomainError,
    CantIssueInvoiceDomainError,
    ApiError(QueryDuplicatedDomainError, QueryDuplicatedDomainErrorDetails),
    NoBalanceFoundDomainError,
    NoProductFoundDomainError,
    InvalidKeysForProductDomainError,
    ProviderUnavailableDomainError,
    NoQueryFoundDomainError,
  ])
  @Roles([UserRoles.REGULAR])
  requestQuery(@UserInfo() userInfo: UserInfo, @Body() inputDto: RequestQueryInputDto): Promise<RequestQueryResult> {
    const token: string = userInfo.maybeToken ?? '';
    const userId: string = userInfo.maybeUserId ?? '';
    return this._requestQueryDomain
      .requestQuery(token, userId, inputDto.queryCode, inputDto.keys, inputDto.clientType, inputDto.mayDuplicate)
      .safeRun();
  }

  @Post('/v2/representation')
  @ApiOperation({ summary: 'request a query version 2' })
  @ApiOkResponseMake(QueryRepresentationWithPopUpEntity)
  @ApiErrorResponseMake([
    UnknownDomainError,
    NoPriceTableFoundDomainError,
    NoUserFoundDomainError,
    InactiveBillingDomainError,
    ProductUnavailableToUserDomainError,
    InsufficientCreditsDomainError,
    CantIssueInvoiceDomainError,
    ApiError(QueryDuplicatedDomainError, QueryDuplicatedDomainErrorDetails),
    NoBalanceFoundDomainError,
    NoProductFoundDomainError,
    InvalidKeysForProductDomainError,
    ProviderUnavailableDomainError,
    NoQueryFoundDomainError,
  ])
  @Roles([UserRoles.REGULAR])
  requestQueryV2(
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: RequestQueryInputDto,
  ): Promise<RequestQueryV2Result> {
    const token: string = userInfo.maybeToken ?? '';
    const userId: string = userInfo.maybeUserId ?? '';
    return this._requestQueryV2Domain
      .requestQuery(token, userId, inputDto.queryCode, inputDto.keys, inputDto.clientType, inputDto.mayDuplicate)
      .safeRun();
  }

  @Post('/create')
  @ApiOperation({ summary: 'request a query version 2' })
  @ApiOkResponseMake(QueryRepresentationWithPopUpEntity)
  @ApiErrorResponseMake([
    UnknownDomainError,
    NoPriceTableFoundDomainError,
    NoUserFoundDomainError,
    InactiveBillingDomainError,
    ProductUnavailableToUserDomainError,
    InsufficientCreditsDomainError,
    CantIssueInvoiceDomainError,
    ApiError(QueryDuplicatedDomainError, QueryDuplicatedDomainErrorDetails),
    NoBalanceFoundDomainError,
    NoProductFoundDomainError,
    InvalidKeysForProductDomainError,
    ProviderUnavailableDomainError,
    NoQueryFoundDomainError,
  ])
  @Roles([UserRoles.REGULAR])
  mekeRequestQueryV2(
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: RequestQueryInputDto,
  ): Promise<RequestQueryV2Result> {
    const token: string = userInfo.maybeToken ?? '';
    const userId: string = userInfo.maybeUserId ?? '';
    return this._requestQueryV2Domain
      .requestQuery(token, userId, inputDto.queryCode, inputDto.keys, inputDto.clientType, inputDto.mayDuplicate)
      .safeRun();
  }

  @Put('/reprocess/:queryId/service-log/:serviceLogId')
  @Roles([UserRoles.REGULAR, UserRoles.ADMIN])
  reprocessFailedService(@Param() inputParams: ReprocessFailedServiceInputDto): Promise<ReprocessFailedServiceResult> {
    return this._reprocessFailedServiceDomain
      .reprocessFailedService(inputParams.queryId, inputParams.serviceLogId)
      .safeRun();
  }

  @Put('/v2/reprocess/:queryId')
  @Roles([UserRoles.REGULAR, UserRoles.ADMIN])
  reprocessQuery(@Param() inputParams: ReprocessQueryInputDto): Promise<ReprocessQueryResult> {
    return this._reprocessQuery.reprocessQuery(inputParams.queryId).safeRun();
  }

  @Put('/v3/reprocess/:queryId')
  @Roles([UserRoles.REGULAR, UserRoles.ADMIN])
  resquestAutoReprocessQuery(
    @UserInfo() userInfo: UserInfo,
    @Param('queryId') queryId: string,
  ): Promise<ResquestAutoReprocessQueryResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._resquestAutoReprocessQueryDomain.requestByQueryId(userId, queryId).safeRun();
  }

  @Post('/query-confirmation')
  @Roles([UserRoles.REGULAR])
  @ApiOkResponseMake(QueryConfirmationEntity)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  getQueryConfirmation(@UserInfo() userInfo: UserInfo, @Body() keys: QueryKeysDto): Promise<QueryConfirmationResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getQueryConfirmationDomain.getQueryConfirmation(keys, userId).safeRun();
  }

  @Get('/has-informations')
  @Roles([UserRoles.REGULAR])
  @ApiOkResponseMake(VehicleInformationsEntity)
  @ApiErrorResponseMake([UnknownDomainError])
  getVehicleInformation(@Query('plate') plate: string): Promise<GetVehicleInformationsResult> {
    return this._getVehicleInformationsDomain.execute({ plate }).safeRun();
  }

  @Get('/:queryId')
  @ApiOperation({ summary: 'return a query' })
  @ApiExcludeEndpoint()
  @ApiOkResponseMake(QueryEntity)
  @ApiErrorResponseMake([UnknownDomainError, NoQueryFoundDomainError])
  @Roles([UserRoles.ADMIN, UserRoles.REGULAR])
  getQuery(@Param() inputDto: GetQueryInputDto): Promise<GetQueryResult> {
    return this._getQueryDomain.getQuery(inputDto.queryId).safeRun();
  }

  @Put('/v2/replace/:queryId')
  @Roles([UserRoles.ADMIN])
  replaceFailedServices(
    @Param('queryId') queryId: string,
    @Body() { services }: ReplaceFailedServicesInputDto,
  ): Promise<ReplaceFailedServicesResult> {
    return this._replaceFailedServicesDomain.replace(queryId, services).safeRun();
  }

  @Post('/pre')
  @Roles([UserRoles.REGULAR])
  @ApiOkResponseMake(PreQueryEntity)
  @ApiErrorResponseMake([UnknownDomainError])
  getPreQuery(@Body() input: PreQueryInputDto): Promise<GetPreQueryResult> {
    return this._getPreQueryDomain.getPreQuery(input).safeRun();
  }
}
