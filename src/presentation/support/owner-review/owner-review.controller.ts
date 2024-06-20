import { Either } from '@alissonfpmorais/minimal_fp';
import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VehicleVersionEntity } from 'src/domain/_entity/vehicle-version.entity';
import { OwnerReviewQueryResult } from 'src/domain/_layer/data/dto/owner-review-query-result.dto';
import { OwnerVehicleParams } from 'src/domain/_layer/data/dto/owner-vehicle-params.dto';
import {
  ListVehicleBrandsDto,
  ListVehicleDetailedModelsDto,
  ListVehicleModelsDto,
  ListVehicleModelYearsDto,
  ListVehicleVersionsByPlateDto,
  ListVehicleVersionsByPlateVehicleVersionsDto,
  ListVehicleVersionsDto,
  VehicleBasicDataDto,
  VehicleBasicDataV2Dto,
  VehiclePreviewDto,
} from 'src/domain/_layer/data/dto/vehicle-abouts.dto';
import {
  VehicleSelectableOption,
  VehicleVersionSelectableOption,
} from 'src/domain/_layer/data/dto/vehicle-selectable-option.dto';
import { CaptchaKind } from 'src/domain/_layer/infrastructure/captcha/captcha.guard';
import { VersionAbout } from 'src/domain/_layer/infrastructure/service/vehicle-version.service';
import { EngageOwnerReviewDto } from 'src/domain/_layer/presentation/dto/engage-owner-review.input-dto';
import {
  PaginatedReviewsFiltersInputDto,
  PaginatedReviewsFiltersV2InputDto,
} from 'src/domain/_layer/presentation/dto/get-paginated-reviews-input.dto';
import { RequestModelExtrasParams } from 'src/domain/_layer/presentation/dto/request-model-extras-input.dto';
import { RequestReview } from 'src/domain/_layer/presentation/dto/request-review-input.dto';
import {
  ListVehicleVersionsByPlateOutputDto,
  ListVehicleVersionsByPlateVehicleVersionsOutputDto,
  ListVehicleVersionsOutputDto,
  VersionsListVehicleVersionsOutputDto,
} from 'src/domain/_layer/presentation/dto/vehicle-about-output.dto';
import { VehicleModelInputDto } from 'src/domain/_layer/presentation/dto/vehicle-model-input.dto';
import { VehicleVersionSelectableOptionOutputDto } from 'src/domain/_layer/presentation/dto/vehicle-selectable-option-output.dto';
import {
  EngageOwnerReviewDomain,
  EngageOwnerReviewResult,
} from 'src/domain/support/owner-review/engage-owner-review.domain';
import {
  FindVehicleParamsDomain,
  FindVehicleParamsResult,
} from 'src/domain/support/owner-review/find-vehicle-params.domain';
import {
  GetOwnerReviewQueryDomain,
  GetOwnerReviewQueryResult,
} from 'src/domain/support/owner-review/get-owner-review-query.domain';
import { GetReviewEngagementDomain } from 'src/domain/support/owner-review/get-review-engagement.domain';
import {
  GetReviewForFipeDomain,
  GetReviewForFipeResult,
} from 'src/domain/support/owner-review/get-review-for-fipe.domain';
import {
  GetVehicleAboutDataDomain,
  GetVehicleAboutDataResult,
  GetVehicleAboutDataV2Result,
} from 'src/domain/support/owner-review/get-vehicle-basic-data.domain';
import {
  ListAllPossibleOptionsDomain,
  ListAllPossibleOptionsUseCaseResult,
} from 'src/domain/support/owner-review/list-all-possible-options.domain';
import {
  ListMostRatedVehiclesDomain,
  ListMostRatedVehiclesResult,
} from 'src/domain/support/owner-review/list-most-rated-vehicles.domain';
import { ListReviewsDomain, ListReviewsDomainResult } from 'src/domain/support/owner-review/list-reviews.domain';
import {
  ListVehicleBrandsDomain,
  ListVehicleBrandsResult,
} from 'src/domain/support/owner-review/list-vehicle-brands.domain';
import {
  ListVehicleDetailedModelsDomain,
  ListVehicleDetailedModelsResult,
} from 'src/domain/support/owner-review/list-vehicle-detailed-models.domain';
import {
  ListVehicleModelYearsDomain,
  ListVehicleModelYearsResult,
} from 'src/domain/support/owner-review/list-vehicle-model-year.domain';
import {
  ListVehicleModelsDomain,
  ListVehicleModelsResult,
} from 'src/domain/support/owner-review/list-vehicle-models.domain';
import { ListVehicleVersionsDomain } from 'src/domain/support/owner-review/list-vehicle-versions.domain';
import {
  RequestOwnerReviewQueryDomain,
  RequestOwnerReviewQueryResult,
} from 'src/domain/support/owner-review/request-owner-review-query.domain';
import { RequestReviewDomain } from 'src/domain/support/owner-review/request-review.domain';
import {
  SendOwnerReviewDomain,
  SendOwnerReviewResult,
} from 'src/domain/support/owner-review/send-owner-reviews.domain';
import { ApiList } from 'src/infrastructure/framework/swagger/schemas/list.schema';
import { Captcha } from 'src/infrastructure/guard/captcha.guard';
import { FipeCodeObfuscatorUtil } from 'src/infrastructure/util/fipe-code-obfuscator.util';
import {
  DataNotFoundDomainError,
  OwnerReviewNotProcess,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import {
  CarOwnerReviewDto,
  OwnerReviewDto,
  OwnerReviewFullDto,
  RankingDto,
} from '../../../domain/_layer/data/dto/owner-review.dto';
import { GetOwnerReviewsInputDto } from '../../../domain/_layer/presentation/dto/get-owner-review-input.dto';
import { PaginationInputDto } from '../../../domain/_layer/presentation/dto/pagination-input.dto';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';
import {
  GetOwnerReviewResult,
  GetOwnerReviewsDomain,
} from '../../../domain/support/owner-review/get-owner-reviews.domain';
import { ApiPagination } from '../../../infrastructure/framework/swagger/schemas/pagination.schema';
import {
  ApiErrorResponseMake,
  ApiOkResponseMake,
} from '../../../infrastructure/framework/swagger/setup/swagger-builders';
import { Roles } from '../../../infrastructure/guard/roles.guard';

@ApiTags('Opinião do dono')
@Controller('owner-review')
export class OwnerReviewController {
  constructor(
    private readonly _getOwnerReview: GetOwnerReviewsDomain,
    private readonly _sendOwnerReview: SendOwnerReviewDomain,
    private readonly _engageOwnerReview: EngageOwnerReviewDomain,
    private readonly _getReviewEngagement: GetReviewEngagementDomain,
    private readonly _listReviewsDomain: ListReviewsDomain,
    private readonly _listVehicleBrandsDomain: ListVehicleBrandsDomain,
    private readonly _listVehicleModelsDomain: ListVehicleModelsDomain,
    private readonly _listVehicleModelYearsDomain: ListVehicleModelYearsDomain,
    private readonly _listVehicleDetailedModelsDomain: ListVehicleDetailedModelsDomain,
    private readonly _getReviewForFipeDomain: GetReviewForFipeDomain,
    private readonly _requestOwnerReviewQueryDomain: RequestOwnerReviewQueryDomain,
    private readonly _getOwnerReviewQueryDomain: GetOwnerReviewQueryDomain,
    private readonly _getVehicleAboutDataDomain: GetVehicleAboutDataDomain,
    private readonly _listMostRatedVehiclesDomain: ListMostRatedVehiclesDomain,
    private readonly _findVehicleParamsDomain: FindVehicleParamsDomain,
    private readonly _listAllPossibleOptionsDomain: ListAllPossibleOptionsDomain,
    private readonly _listVehicleVersionsDomain: ListVehicleVersionsDomain,
    private readonly _requestReviewDomain: RequestReviewDomain,
    private readonly _fipeCodeObfuscatorUtil: FipeCodeObfuscatorUtil,
  ) {}

  @Get('all/paginated')
  @ApiOkResponseMake(ApiPagination(OwnerReviewFullDto))
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getReviewsInPage(
    @Query() inputDto: PaginatedReviewsFiltersInputDto,
    @Query() paginationInputDto: PaginationInputDto,
  ): Promise<ListReviewsDomainResult> {
    return this._listReviewsDomain.listPaginated(paginationInputDto, { ...inputDto, ...paginationInputDto }).safeRun();
  }

  @Get('all/paginated/v2')
  @ApiOkResponseMake(ApiPagination(OwnerReviewFullDto))
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getReviewsInPageV2(
    @Query() { versionCode, ...inputDto }: PaginatedReviewsFiltersV2InputDto,
    @Query() paginationInputDto: PaginationInputDto,
  ): Promise<ListReviewsDomainResult> {
    return this._listReviewsDomain
      .listPaginatedV2(paginationInputDto, {
        ...inputDto,
        ...paginationInputDto,
        fipeId: this._fipeCodeObfuscatorUtil.deobfuscateFipeCode(versionCode),
      })
      .safeRun();
  }

  @Get('get-owner-reviews')
  @ApiOperation({ summary: 'Get paginated owner reviews by brand model code or fipeId' })
  @ApiOkResponseMake(ApiPagination(OwnerReviewDto))
  @ApiErrorResponseMake(UnknownDomainError)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getOwnerReviews(
    @Query() inputDto: GetOwnerReviewsInputDto,
    @Query() paginationInputDto: PaginationInputDto,
  ): Promise<GetOwnerReviewResult> {
    return this._getOwnerReview
      .getOwnerReviews(inputDto.brandModelCode, inputDto.fipeId, paginationInputDto.page, paginationInputDto.perPage)
      .safeRun();
  }

  @Post('')
  @ApiOperation({ summary: 'Send an owner review' })
  @ApiOkResponseMake(CarOwnerReviewDto)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError, OwnerReviewNotProcess])
  @Roles([UserRoles.GUEST])
  sendOwnerReview(@Body() carOwnerReview: CarOwnerReviewDto): Promise<SendOwnerReviewResult> {
    return this._sendOwnerReview.create(carOwnerReview).safeRun();
  }

  @Get('/engage/:reviewId')
  @ApiOperation({ summary: 'get engagement (like/dislike) for a review' })
  @ApiOkResponseMake(OwnerReviewDto)
  @ApiErrorResponseMake(UnknownDomainError)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getEngagementReview(@Param('reviewId') reviewId: string): Promise<EngageOwnerReviewResult> {
    return this._getReviewEngagement.getAnonymouslyEngagement(reviewId).safeRun();
  }

  @Put('/engage/:reviewId')
  @ApiOperation({ summary: 'anonymously engage (like/dislike) a review' })
  @ApiOkResponseMake(OwnerReviewDto)
  @ApiErrorResponseMake(UnknownDomainError)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  engageReview(
    @Body() { reaction }: EngageOwnerReviewDto,
    @Param('reviewId') reviewId: string,
  ): Promise<EngageOwnerReviewResult> {
    return this._engageOwnerReview.anonymouslyEngage(reviewId, reaction).safeRun();
  }

  @Get('/vehicle/brands')
  @ApiOkResponseMake(ListVehicleBrandsDto)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getBrands(): Promise<ListVehicleBrandsResult> {
    return this._listVehicleBrandsDomain.listBrands().safeRun();
  }

  @Get('/vehicle/brands/:brandName/models')
  @ApiOkResponseMake(ListVehicleModelsDto)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getModels(@Param('brandName') brandName: string): Promise<ListVehicleModelsResult> {
    return this._listVehicleModelsDomain.listModelsByBrand(brandName).safeRun();
  }

  @Get('/vehicle/brands/:brandName/models/:modelName/model-years')
  @ApiOkResponseMake(ListVehicleModelYearsDto)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getModelYears(
    @Param('brandName') brandName: string,
    @Param('modelName') codModel: string,
  ): Promise<ListVehicleModelYearsResult> {
    return this._listVehicleModelYearsDomain.listModelYearByModel(brandName, codModel).safeRun();
  }

  @Get('/vehicle/brands/:brandName/models/:modelName/model-years/:year/detailed-models')
  @ApiOkResponseMake(ListVehicleDetailedModelsDto)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getDetailed(
    @Param('brandName') brandName: string,
    @Param('modelName') codModel: string,
    @Param('year', new ParseIntPipe()) modelYear: number,
  ): Promise<ListVehicleDetailedModelsResult> {
    return this._listVehicleDetailedModelsDomain
      .listDetailedModelsByBrandModelYear(brandName, codModel, modelYear)
      .safeRun();
  }

  @Get('/v2/vehicle/brands')
  @ApiOkResponseMake(ListVehicleBrandsDto)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getBrandsV2(): Promise<ListVehicleBrandsResult> {
    return this._listVehicleBrandsDomain.listBrandsV2().safeRun();
  }

  @Get('/v2/vehicle/brands/:brandName/models')
  @ApiOkResponseMake(ListVehicleModelsDto)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getModelsV2(@Param('brandName') brandName: string): Promise<ListVehicleModelsResult> {
    return this._listVehicleModelsDomain.listModelsByBrandV2(brandName).safeRun();
  }

  @Get('/v2/vehicle/brands/:brandName/models/:modelName/model-years')
  @ApiOkResponseMake(ListVehicleModelYearsDto)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getModelYearsV2(
    @Param('brandName') brandName: string,
    @Param('modelName') codModel: string,
  ): Promise<ListVehicleModelYearsResult> {
    return this._listVehicleModelYearsDomain.listModelYearByModelV2(brandName, codModel).safeRun();
  }

  @Get('/v2/vehicle/brands/:brandName/models/:modelName/model-years/:year/versions')
  @ApiOkResponseMake(ListVehicleVersionsOutputDto)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getVersions(
    @Param('brandName') brandName: string,
    @Param('modelName') modelName: string,
    @Param('year', new ParseIntPipe()) modelYear: number,
  ): Promise<Either<unknown, ListVehicleVersionsOutputDto>> {
    return this._listVehicleVersionsDomain
      .listVersionsByBrandModelYear(brandName, modelName, modelYear)
      .map(
        (result: ListVehicleVersionsDto): ListVehicleVersionsOutputDto => ({
          versions: result.versions.map(
            (version: VehicleVersionEntity): VersionsListVehicleVersionsOutputDto => ({
              versionCode: this._fipeCodeObfuscatorUtil.obfuscateFipeCode(version.fipeId),
              versionName: version.versionName,
            }),
          ),
        }),
      )
      .safeRun();
  }

  @Get('/vehicle/brands/:brandName/models/:modelName/model-years/:year/detailed-model/:detailedModel/info-about')
  @ApiOkResponseMake(VehicleBasicDataDto)
  @ApiErrorResponseMake([ProviderUnavailableDomainError, DataNotFoundDomainError])
  @Roles([UserRoles.GUEST])
  getVehicleAbout(
    @Param('brandName') brandName: string,
    @Param('modelName') modelName: string,
    @Param('year', new ParseIntPipe()) year: number,
    @Param('detailedModel') detailedModel: string,
  ): Promise<GetVehicleAboutDataResult> {
    return this._getVehicleAboutDataDomain.getByBrandModelYear(brandName, modelName, year, detailedModel).safeRun();
  }

  @Get('/v2/vehicle/versions/:versionCode/info-about')
  @ApiOkResponseMake(VehicleBasicDataV2Dto)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getVersionsV2(
    @Param('versionCode') versionCode: string,
    @Query('modelYear', new ParseIntPipe()) modelYear: number,
  ): Promise<GetVehicleAboutDataV2Result> {
    return this._getVehicleAboutDataDomain
      .getByBrandModelYearV2(this._fipeCodeObfuscatorUtil.deobfuscateFipeCode(versionCode), modelYear)
      .safeRun();
  }

  @Get('/vehicle/params')
  @ApiOkResponseMake(OwnerVehicleParams)
  @ApiErrorResponseMake([ProviderUnavailableDomainError, DataNotFoundDomainError])
  @Roles([UserRoles.GUEST])
  @Captcha(CaptchaKind.GOOGLE_RECAPTCHA_V2)
  getVehicleParamsByPlate(@Query('plate') plate: string): Promise<FindVehicleParamsResult> {
    return this._findVehicleParamsDomain.findParamsByPlate(plate).safeRun();
  }

  @Get('/by-fipe-id/:fipeId/ranking')
  @Roles([UserRoles.GUEST])
  @ApiOkResponseMake(RankingDto)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  getRankingFipeId(@Param('fipeId') fipeId: string): Promise<GetReviewForFipeResult> {
    return this._getReviewForFipeDomain.getReviewForFipe(fipeId).safeRun();
  }

  @Post('/vehicle/extras')
  @ApiOkResponseMake(OwnerReviewQueryResult)
  @HttpCode(204)
  @ApiErrorResponseMake([ProviderUnavailableDomainError, DataNotFoundDomainError])
  @Roles([UserRoles.GUEST])
  requestOwnerReviewQuery(@Body() model: VehicleModelInputDto): Promise<RequestOwnerReviewQueryResult> {
    return this._requestOwnerReviewQueryDomain
      .requestOwnerReviewQuery({
        brandName: model.brandName,
        fipeId: this._fipeCodeObfuscatorUtil.deobfuscateFipeCode(model.versionCode),
        modelYear: model.modelYear,
      })
      .safeRun();
  }

  @Get('/vehicle/extras')
  @ApiOkResponseMake(OwnerReviewQueryResult)
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getOwnerReviewQuery(@Query() query: RequestModelExtrasParams): Promise<GetOwnerReviewQueryResult> {
    return this._getOwnerReviewQueryDomain
      .getOwnerReviewQueryByVehicle(
        this._fipeCodeObfuscatorUtil.deobfuscateFipeCode(query.versionCode),
        query.modelYear,
      )
      .safeRun();
  }

  @Get('/vehicle/models/most-rated')
  @ApiOkResponseMake(ApiList(VehiclePreviewDto))
  @ApiErrorResponseMake(ProviderUnavailableDomainError)
  @Roles([UserRoles.GUEST])
  getMostRatedModels(): Promise<ListMostRatedVehiclesResult> {
    return this._listMostRatedVehiclesDomain.listMostRated().safeRun();
  }

  @Get('/vehicle/all-possible-options')
  @ApiOkResponseMake(ApiList(VehicleSelectableOption))
  @ApiErrorResponseMake([])
  @Roles([UserRoles.GUEST])
  listAllPossibleOptions(): Promise<ListAllPossibleOptionsUseCaseResult> {
    return this._listAllPossibleOptionsDomain.listAllOptions().safeRun();
  }

  @Get('/v2/vehicle/all-possible-options')
  @ApiOkResponseMake(ApiList(VehicleVersionSelectableOptionOutputDto))
  @ApiErrorResponseMake([])
  @Roles([UserRoles.GUEST])
  listAllPossibleOptionsV2(): Promise<Either<unknown, ReadonlyArray<VehicleVersionSelectableOptionOutputDto>>> {
    return this._listAllPossibleOptionsDomain
      .listAllOptionsV2()
      .map((vehicles: ReadonlyArray<VehicleVersionSelectableOption>) =>
        vehicles.map((vehicle: VersionAbout): VehicleVersionSelectableOptionOutputDto => {
          const fipeCode: string = vehicle.fipeCode;
          delete vehicle.fipeCode;
          const newVehicle: VehicleVersionSelectableOptionOutputDto =
            vehicle as unknown as VehicleVersionSelectableOptionOutputDto;
          newVehicle.versionCode = this._fipeCodeObfuscatorUtil.obfuscateFipeCode(fipeCode.replace('-', ''));
          return newVehicle;
        }),
      )
      .safeRun();
  }

  @Get('/plate/:plate/versions')
  @ApiOkResponseMake(ListVehicleVersionsByPlateDto)
  @ApiErrorResponseMake([ProviderUnavailableDomainError])
  @Roles([UserRoles.GUEST])
  @Captcha(CaptchaKind.GOOGLE_RECAPTCHA_V2)
  listVersionsByPlate(@Param('plate') plate: string): Promise<Either<unknown, ListVehicleVersionsByPlateOutputDto>> {
    return this._listVehicleVersionsDomain
      .listVersionsByPlate(plate)
      .map((vehicleVersions: ListVehicleVersionsByPlateDto) => ({
        ...vehicleVersions,
        vehicleVersions: vehicleVersions.vehicleVersions.map(
          (
            version: ListVehicleVersionsByPlateVehicleVersionsDto,
          ): ListVehicleVersionsByPlateVehicleVersionsOutputDto => ({
            brandName: version.brandName,
            versionCode: this._fipeCodeObfuscatorUtil.obfuscateFipeCode(version.fipeId),
            modelName: version.modelName,
            versionName: version.versionName,
          }),
        ),
      }))
      .safeRun();
  }

  @Post('/blog/review')
  @Roles([UserRoles.GUEST])
  @HttpCode(204)
  @Captcha(CaptchaKind.GOOGLE_RECAPTCHA_V2)
  async requestReview(@Body() params: RequestReview): Promise<void> {
    await this._requestReviewDomain
      .requestReview(
        params.email,
        this._fipeCodeObfuscatorUtil.deobfuscateFipeCode(params.versionCode),
        params.modelYear,
      )
      .unsafeRun();
  }
}
