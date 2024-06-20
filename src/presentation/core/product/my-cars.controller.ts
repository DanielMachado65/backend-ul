import { Either } from '@alissonfpmorais/minimal_fp';
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MyCarProductEntity } from 'src/domain/_entity/my-car-product.entity';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  FirstFreeMyCarIsAvailableDomainError,
  MyCarAlreadyExistsDomainError,
  MyCarIsAlreadyRegisteredDomainError,
  NoPlanFoundDomainError,
  NoUserFoundDomainError,
  NotMongoIdError,
  ProviderNoDataForSelectedVersion,
  ProviderUnavailableDomainError,
  UnavailableForCurrentCarTier,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { SubscriptionEntity } from 'src/domain/_entity/subscription.entity';
import { NotificationIdentifier } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { RegisterMyCarInputDto } from 'src/domain/_layer/presentation/dto/create-my-car-input.dto';
import {
  MyCarQueryDatasheet,
  MyCarQueryFines,
  MyCarQueryInsuranceQuote,
  MyCarQueryMainFlaws,
  MyCarQueryOwnerReview,
  MyCarQueryPartsAndValues,
  MyCarQueryPriceFIPE,
  MyCarQueryRevisionPlan,
} from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { PaginationInputDto } from 'src/domain/_layer/presentation/dto/pagination-input.dto';
import { PlanAvailabilityOutputDto } from 'src/domain/_layer/presentation/dto/plan-availability-output.dto';
import {
  FineAlertConfigurationInputDto,
  OnQueryAlertConfigurationInputDto,
  PriceFIPEAlertConfigurationInputDto,
  RevisionAlertConfigurationInputDto,
} from 'src/domain/_layer/presentation/dto/product-feature-configuration-input.dto';
import { SubscriptionOutputDto } from 'src/domain/_layer/presentation/dto/subscription-output.dto';
import { UpgradeCarToPremiumInputDto } from 'src/domain/_layer/presentation/dto/upgrade-car-to-premium-input.dto';
import { ApiRoles } from 'src/domain/_layer/presentation/roles/api-roles.enum';
import { ConfigureAlertFineDomain } from 'src/domain/core/product/configure-alert-fine.domain';
import {
  ConfigureAlertFipePriceDomain,
  ConfigureAlertFipePriceResult,
} from 'src/domain/core/product/configure-alert-fipe-price.domain';
import {
  ConfigureAlertOnQueryDomain,
  ConfigureAlertOnQueryResult,
} from 'src/domain/core/product/configure-alert-on-query.domain';
import {
  ConfigureAlertRevisionDomain,
  ConfigureAlertRevisionResult,
} from 'src/domain/core/product/configure-alert-revision.domain';
import { DispatchNotificationDomain } from 'src/domain/core/product/dispatch-notification.domain';
import {
  ExcludeProductBoughtDomain,
  ExcludeProductBoughtResult,
} from 'src/domain/core/product/exclude-bought-product.domain';
import { GetFineMyCarProductDomain, GetFineResult } from 'src/domain/core/product/get-alert-fine-config.domain';
import {
  GetAlertFipePriceConfigDomain,
  GetAlertFipePriceConfigResult,
} from 'src/domain/core/product/get-alert-fipe-price-config.domain.';
import {
  GetAlertOnQueryConfigDomain,
  GetAlertOnQueryConfigResult,
} from 'src/domain/core/product/get-alert-on-query-config.domain';
import {
  GetRevisionConfigMyCarProductDomain,
  GetRevisionConfigResult,
} from 'src/domain/core/product/get-alert-revision-plan-config.domain';
import { GetBoughtProductDomain, GetBoughtProductResult } from 'src/domain/core/product/get-bought-product.domain';
import {
  GetPlanAvailabilityDomain,
  GetPlanAvailabilityResult,
} from 'src/domain/core/product/get-plan-availability.domain';
import {
  ListAllBoughtProductDomain,
  ListAllBoughtProductResult,
} from 'src/domain/core/product/list-all-bought-product.domain';
import { QueryDatasheetDomain, QueryDatasheetResult } from 'src/domain/core/product/query-datasheet.domain';
import { QueryFinesDomain, QueryFinesResult } from 'src/domain/core/product/query-fines.domain';
import { QueryFipePriceDomain, QueryFipePriceResult } from 'src/domain/core/product/query-fipe-price.domain';
import {
  QueryInsuranceQuoteDomain,
  QueryInsuranceQuoteResult,
} from 'src/domain/core/product/query-insurance-quote.domain';
import { QueryMainFlawsDomain, QueryMainFlawsResult } from 'src/domain/core/product/query-main-flaws.domain';
import { QueryOwnerReviewDomain, QueryOwnerReviewResult } from 'src/domain/core/product/query-owner-review.domain';
import {
  QueryPartsAndValuesDomain,
  QueryPartsAndValuesResult,
} from 'src/domain/core/product/query-parts-and-values.domain';
import { QueryRevisionPlanDomain, QueryRevisionPlanResult } from 'src/domain/core/product/query-revision-plan.domain';
import { RegisterMyCarDomain, RegisterMyCarResult } from 'src/domain/core/product/register-my-car.domain';
import { UpgradeMyCarProductToPremiumDomain } from 'src/domain/core/product/upgrade-my-car-product-to-premium.domain';
import { ApiPagination } from 'src/infrastructure/framework/swagger/schemas/pagination.schema';
import { ApiErrorResponseMake, ApiOkResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import { Roles } from 'src/infrastructure/guard/roles.guard';
import { UserInfo } from 'src/infrastructure/middleware/user-info.middleware';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';

@ApiTags('Meus Carros')
@Controller('my-cars')
export class MyCarsController {
  constructor(
    private readonly _getBoughtProductDomain: GetBoughtProductDomain,
    private readonly _excludeProductBoughtDomain: ExcludeProductBoughtDomain,
    private readonly _listAllBoughtProductDomain: ListAllBoughtProductDomain,
    private readonly _registerMyCarDomain: RegisterMyCarDomain,
    private readonly _upgradeMyCarProductToPremiumDomain: UpgradeMyCarProductToPremiumDomain,
    private readonly _queryDatasheetDomain: QueryDatasheetDomain,
    private readonly _queryFinesDomain: QueryFinesDomain,
    private readonly _queryFipePriceDomain: QueryFipePriceDomain,
    private readonly _queryInsuranceQuoteDomain: QueryInsuranceQuoteDomain,
    private readonly _queryMainFlawsDomain: QueryMainFlawsDomain,
    private readonly _queryOwnerReviewDomain: QueryOwnerReviewDomain,
    private readonly _queryPartsAndValuesDomain: QueryPartsAndValuesDomain,
    private readonly _queryRevisionPlanDomain: QueryRevisionPlanDomain,
    private readonly _getPlanAvailabilityDomain: GetPlanAvailabilityDomain,
    private readonly _configureAlertRevisionDomain: ConfigureAlertRevisionDomain,
    private readonly _configureAlertOnQueryDomain: ConfigureAlertOnQueryDomain,
    private readonly _configureAlertFineDomain: ConfigureAlertFineDomain,
    private readonly _getAlertOnQueryConfigDomain: GetAlertOnQueryConfigDomain,
    private readonly _getAlertFipePriceConfigDomain: GetAlertFipePriceConfigDomain,
    private readonly _getAlertRevisionConfigDomain: GetRevisionConfigMyCarProductDomain,
    private readonly _getAlertFineConfigDomain: GetFineMyCarProductDomain,
    private readonly _dispatchNotificationDomain: DispatchNotificationDomain,
    private readonly _configureAlertFipePriceDomain: ConfigureAlertFipePriceDomain,
  ) {}

  @Post('/car')
  @ApiBearerAuth()
  @ApiOperation({ summary: `Add a new "my car" entry` })
  @ApiOkResponseMake(MyCarProductEntity)
  @ApiErrorResponseMake([
    UnknownDomainError,
    ProviderUnavailableDomainError,
    NoUserFoundDomainError,
    MyCarAlreadyExistsDomainError,
    MyCarIsAlreadyRegisteredDomainError,
    FirstFreeMyCarIsAvailableDomainError,
  ])
  @Roles([UserRoles.REGULAR])
  createProduct(@UserInfo() userInfo: UserInfo, @Body() body: RegisterMyCarInputDto): Promise<RegisterMyCarResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._registerMyCarDomain.registerPlate(userId, body.plate, body.fipeId, body.creditCardId).safeRun();
  }

  @Get('/car')
  @ApiBearerAuth()
  @ApiOperation({ summary: `List all user's "my car" entries` })
  @ApiOkResponseMake(ApiPagination(MyCarProductEntity))
  @ApiErrorResponseMake(UnknownDomainError)
  @Roles([UserRoles.REGULAR])
  listAllOwned(
    @Query() { page, perPage }: PaginationInputDto,
    @UserInfo() userInfo: UserInfo,
  ): Promise<ListAllBoughtProductResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._listAllBoughtProductDomain.listAll(userId, page, perPage).safeRun();
  }

  @Get('/car/:carId')
  @ApiBearerAuth()
  @ApiOperation({ summary: `Get a "my car" entry from a specific user` })
  @ApiOkResponseMake(MyCarProductEntity)
  @ApiErrorResponseMake(UnknownDomainError)
  @Roles([UserRoles.REGULAR])
  getProduct(@UserInfo() userInfo: UserInfo, @Param('carId') carId: string): Promise<GetBoughtProductResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getBoughtProductDomain.getById(carId, userId).safeRun();
  }

  @Delete('/car/:carId')
  @ApiBearerAuth()
  @ApiOperation({ summary: `Delete a single entry from user's "my car"` })
  @ApiOkResponseMake(MyCarProductEntity)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  @Roles([UserRoles.REGULAR])
  cancelProduct(@UserInfo() userInfo: UserInfo, @Param('carId') carId: string): Promise<ExcludeProductBoughtResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._excludeProductBoughtDomain.excludeById(carId, userId).safeRun();
  }

  @Get('/car/plan/availability')
  @ApiBearerAuth()
  @ApiOperation({ summary: `Get user's plan availability` })
  @ApiOkResponseMake(PlanAvailabilityOutputDto)
  @ApiErrorResponseMake([UnknownDomainError, NoPlanFoundDomainError])
  @Roles([UserRoles.GUEST, UserRoles.REGULAR])
  getPlanAvailability(@UserInfo() userInfo: UserInfo): Promise<GetPlanAvailabilityResult> {
    return this._getPlanAvailabilityDomain.getPlanAvailability(userInfo.maybeUserId).safeRun();
  }

  @Post('/premium-plan')
  @ApiBearerAuth()
  @ApiOperation({ summary: `Upgrade from a free "my car" entry to premium` })
  @ApiOkResponseMake(SubscriptionOutputDto)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  @Roles([UserRoles.REGULAR])
  upgradeToPremium(
    @UserInfo() userInfo: UserInfo,
    @Body() params: UpgradeCarToPremiumInputDto,
  ): Promise<Either<unknown, SubscriptionOutputDto>> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._upgradeMyCarProductToPremiumDomain
      .upgrade(params.myCarProductId, userId, params.creditCardId)
      .map(
        (subscription: SubscriptionEntity): SubscriptionOutputDto => ({
          plan: null, // TODO
          relatedData: null,
          creditCardLast4: null,
          creditCardId: params.creditCardId,
          id: subscription.id,
          userId: subscription.userId,
          status: subscription.status,
          planTag: subscription.planTag,
          lastChargeInCents: 0,
          deactivatedAt: subscription.deactivatedAt,
          nextChargeAt: subscription.nextChargeAt,
          expiresAt: subscription.expiresAt,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
        }),
      )
      .safeRun();
  }

  /** Alerta de revisão */
  @Get('/car/:carId/alert-revision/config')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revision alert config for a single "my car" entry' })
  @ApiOkResponseMake(RevisionAlertConfigurationInputDto)
  @ApiErrorResponseMake([UnknownDomainError, UnavailableForCurrentCarTier, NotMongoIdError])
  @Roles([UserRoles.REGULAR])
  getAlertRevisionConfig(
    @UserInfo() userInfo: UserInfo,
    @Param('carId') carId: string,
  ): Promise<GetRevisionConfigResult> {
    const userId: string = userInfo.maybeUserId ?? '';

    return this._getAlertRevisionConfigDomain.getRevisionPlanConfig(carId, userId).safeRun();
  }

  @Put('/car/:carId/alert-revision/config')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup revision alert config for a single "my car" entry' })
  @ApiOkResponseMake(RevisionAlertConfigurationInputDto)
  @ApiErrorResponseMake([UnknownDomainError, UnavailableForCurrentCarTier])
  @Roles([UserRoles.REGULAR])
  configureAlertRevision(
    @UserInfo() userInfo: UserInfo,
    @Param('carId') carId: string,
    @Body() body: RevisionAlertConfigurationInputDto,
  ): Promise<ConfigureAlertRevisionResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._configureAlertRevisionDomain.configure(carId, userId, body).safeRun();
  }

  /** Alerta de multas */
  @Get('/car/:carId/alert-fine/config')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get fines alert config for a single "my car" entry' })
  @ApiOkResponseMake(FineAlertConfigurationInputDto)
  @ApiErrorResponseMake([UnknownDomainError, UnavailableForCurrentCarTier, NotMongoIdError])
  @Roles([UserRoles.REGULAR])
  getAlertFineConfig(@UserInfo() userInfo: UserInfo, @Param('carId') carId: string): Promise<GetFineResult> {
    const userId: string = userInfo.maybeUserId ?? '';

    return this._getAlertFineConfigDomain.getFineConfig(carId, userId).safeRun();
  }

  @Put('/car/:carId/alert-fine/config')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup fines alert config for a single "my car" entry' })
  @ApiOkResponseMake(FineAlertConfigurationInputDto)
  @ApiErrorResponseMake([UnknownDomainError, UnavailableForCurrentCarTier, NotMongoIdError])
  @Roles([UserRoles.REGULAR])
  configureFineOnQuery(
    @UserInfo() userInfo: UserInfo,
    @Param('carId') carId: string,
    @Body() body: FineAlertConfigurationInputDto,
  ): Promise<unknown> {
    const userId: string = userInfo.maybeUserId ?? '';

    return this._configureAlertFineDomain.configure(carId, userId, body).safeRun();
  }

  /** Alerta de preço */
  @Get('/car/:carId/alert-fipe-price/config')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get FIPE price alert config for a single "my car" entry' })
  @ApiOkResponseMake(PriceFIPEAlertConfigurationInputDto)
  @ApiErrorResponseMake([UnknownDomainError, CarNotFoundError])
  @Roles([UserRoles.REGULAR])
  getAlertFipePriceConfig(
    @UserInfo() userInfo: UserInfo,
    @Param('carId') carId: string,
  ): Promise<GetAlertFipePriceConfigResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getAlertFipePriceConfigDomain.load(carId, userId).safeRun();
  }

  @Put('/car/:carId/alert-fipe-price/config')
  @ApiOperation({ summary: 'Setup FIPE price alert config for a single "my car" entry' })
  @ApiOkResponseMake(PriceFIPEAlertConfigurationInputDto)
  @ApiErrorResponseMake([UnknownDomainError, CarNotFoundError])
  @Roles([UserRoles.REGULAR])
  configureAlertFipePrice(
    @UserInfo() userInfo: UserInfo,
    @Param('carId') carId: string,
    @Body() body: PriceFIPEAlertConfigurationInputDto,
  ): Promise<ConfigureAlertFipePriceResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._configureAlertFipePriceDomain
      .configure(carId, userId, {
        isEnabled: body.isEnabled,
        notificationChannels: body.notificationChannels,
      })
      .safeRun();
  }

  /** Alerta de consulta */
  @Get('/car/:carId/alert-on-query/config')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get query alert config for a single "my car" entry' })
  @ApiOkResponseMake(OnQueryAlertConfigurationInputDto)
  @ApiErrorResponseMake([UnknownDomainError, UnavailableForCurrentCarTier])
  @Roles([UserRoles.REGULAR])
  getAlertOnQueryConfig(
    @UserInfo() userInfo: UserInfo,
    @Param('carId') carId: string,
  ): Promise<GetAlertOnQueryConfigResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getAlertOnQueryConfigDomain.load(carId, userId).safeRun();
  }

  @Put('/car/:carId/alert-on-query/config')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup query alert config for a single "my car" entry' })
  @ApiOkResponseMake(OnQueryAlertConfigurationInputDto)
  @ApiErrorResponseMake([UnknownDomainError, UnavailableForCurrentCarTier])
  @Roles([UserRoles.REGULAR])
  async configureAlertOnQuery(
    @UserInfo() userInfo: UserInfo,
    @Param('carId') carId: string,
    @Body() body: OnQueryAlertConfigurationInputDto,
  ): Promise<ConfigureAlertOnQueryResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._configureAlertOnQueryDomain
      .configure(carId, userId, {
        isEnabled: body.isEnabled,
        notificationChannels: body.notificationChannels,
      })
      .safeRun();
  }

  /** Query related */
  @Post('/:carId/datasheet/query')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute a datasheet query' })
  @ApiOkResponseMake(MyCarQueryDatasheet)
  @ApiErrorResponseMake([
    UnknownDomainError,
    CarNotFoundError,
    CarSubscriptionDeactivatedFoundError,
    ProviderUnavailableDomainError,
    ProviderNoDataForSelectedVersion,
  ])
  @Roles([UserRoles.REGULAR])
  queryDatasheet(@UserInfo() userInfo: UserInfo, @Param('carId') carId: string): Promise<QueryDatasheetResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._queryDatasheetDomain.execute(userId, carId).safeRun();
  }

  @Post('/:carId/fines/query')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute a fines query' })
  @ApiOkResponseMake(MyCarQueryFines)
  @ApiErrorResponseMake([
    UnknownDomainError,
    CarNotFoundError,
    CarSubscriptionDeactivatedFoundError,
    ProviderUnavailableDomainError,
  ])
  @Roles([UserRoles.REGULAR])
  queryFines(@UserInfo() userInfo: UserInfo, @Param('carId') carId: string): Promise<QueryFinesResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._queryFinesDomain.execute(userId, carId).safeRun();
  }

  @Post('/:carId/fipe-price/query')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute a FIPE price query' })
  @ApiOkResponseMake(MyCarQueryPriceFIPE)
  @ApiErrorResponseMake([
    UnknownDomainError,
    CarNotFoundError,
    CarSubscriptionDeactivatedFoundError,
    ProviderUnavailableDomainError,
    ProviderNoDataForSelectedVersion,
  ])
  @Roles([UserRoles.REGULAR])
  queryFipePrice(@UserInfo() userInfo: UserInfo, @Param('carId') carId: string): Promise<QueryFipePriceResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._queryFipePriceDomain.execute(userId, carId).safeRun();
  }

  @Post('/:carId/insurance-quote/query')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute an insurance quote query' })
  @ApiOkResponseMake(MyCarQueryInsuranceQuote)
  @ApiErrorResponseMake([
    UnknownDomainError,
    CarNotFoundError,
    CarSubscriptionDeactivatedFoundError,
    ProviderUnavailableDomainError,
    ProviderNoDataForSelectedVersion,
  ])
  @Roles([UserRoles.REGULAR])
  queryInsuranceQuote(
    @UserInfo() userInfo: UserInfo,
    @Param('carId') carId: string,
    @Body() inputDto: { readonly zipCode: string }, // TODO
  ): Promise<QueryInsuranceQuoteResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._queryInsuranceQuoteDomain.execute(userId, carId, inputDto.zipCode).safeRun();
  }

  @Post('/:carId/main-flaws/query')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute a main flaws query' })
  @ApiOkResponseMake(MyCarQueryMainFlaws)
  @ApiErrorResponseMake([
    UnknownDomainError,
    CarNotFoundError,
    CarSubscriptionDeactivatedFoundError,
    ProviderUnavailableDomainError,
  ])
  @Roles([UserRoles.REGULAR])
  queryMainFlaws(@UserInfo() userInfo: UserInfo, @Param('carId') carId: string): Promise<QueryMainFlawsResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._queryMainFlawsDomain.execute(userId, carId).safeRun();
  }

  @Post('/:carId/owner-review/query')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute a owner review query' })
  @ApiOkResponseMake(MyCarQueryOwnerReview)
  @ApiErrorResponseMake([
    UnknownDomainError,
    CarNotFoundError,
    CarSubscriptionDeactivatedFoundError,
    ProviderUnavailableDomainError,
  ])
  @Roles([UserRoles.REGULAR])
  queryOwnerReview(@UserInfo() userInfo: UserInfo, @Param('carId') carId: string): Promise<QueryOwnerReviewResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._queryOwnerReviewDomain.execute(userId, carId).safeRun();
  }

  @Post('/:carId/parts-and-values/query')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute a parts and values query' })
  @ApiOkResponseMake(MyCarQueryPartsAndValues)
  @ApiErrorResponseMake([
    UnknownDomainError,
    CarNotFoundError,
    CarSubscriptionDeactivatedFoundError,
    ProviderUnavailableDomainError,
    ProviderNoDataForSelectedVersion,
  ])
  @Roles([UserRoles.REGULAR])
  queryPartsAndValues(
    @UserInfo() userInfo: UserInfo,
    @Param('carId') carId: string,
  ): Promise<QueryPartsAndValuesResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._queryPartsAndValuesDomain.execute(userId, carId).safeRun();
  }

  @Post('/:carId/revision-plan/query')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute a revision-plan query' })
  @ApiOkResponseMake(MyCarQueryRevisionPlan)
  @ApiErrorResponseMake([
    UnknownDomainError,
    CarNotFoundError,
    CarSubscriptionDeactivatedFoundError,
    ProviderUnavailableDomainError,
    ProviderNoDataForSelectedVersion,
  ])
  @Roles([UserRoles.REGULAR])
  queryRevisionPlan(@UserInfo() userInfo: UserInfo, @Param('carId') carId: string): Promise<QueryRevisionPlanResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._queryRevisionPlanDomain.execute(userId, carId).safeRun();
  }

  @Post('/notify-schedule')
  @Roles([ApiRoles.SCHEDULER_QUERY_PROVIDER])
  async dispatchNotification(@Body('event') event: NotificationIdentifier): Promise<unknown> {
    return this._dispatchNotificationDomain.send(event).safeRun().finally();
  }
}
