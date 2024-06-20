import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom, Observable } from 'rxjs';
import { EngageResult } from 'src/domain/support/owner-review/engage-owner-review.domain';
import { PaginatedReviews, PaginatedReviewsV2 } from 'src/domain/support/owner-review/list-reviews.domain';
import {
  CarOwnerReviewDto,
  OwnerReviewDto,
  OwnerReviewFullDto,
  OwnerReviewFullV2Dto,
  RankingDto,
} from '../../domain/_layer/data/dto/owner-review.dto';
import { PaginationOf } from '../../domain/_layer/data/dto/pagination.dto';
import {
  OwnerReviewService,
  ReviewListByVersionOptions,
  ReviewListOptions,
  VehicleBasicInfo,
  VehicleBasicInfoByVersion,
  VehicleBrandsList,
  VehicleDetailedModelList,
  VehicleModelsList,
  VehicleModelYearsList,
  VehicleParams,
  VehiclePreview,
  VehicleSelectableOption,
  VehicleVersion,
} from '../../domain/_layer/infrastructure/service/owner-review.service';
import { ENV_KEYS, EnvService } from '../framework/env.service';
import { PaginationUtil } from '../util/pagination.util';

type InternalOwnerReview = {
  readonly license_plate: string;
  readonly owner_id: {
    readonly name: string;
    readonly email: string;
    readonly anonymous: boolean;
    readonly created_at: string;
  };
  readonly ranking_id: {
    readonly comfort: number;
    readonly cambium: number;
    readonly city_consumption: number;
    readonly road_consumption: number;
    readonly performance: number;
    readonly drivability: number;
    readonly internal_space: number;
    readonly stability: number;
    readonly brakes: number;
    readonly trunk: number;
    readonly suspension: number;
    readonly cost_benefit: number;
    readonly total_score: number;
  };
  readonly strengths: string;
  readonly cons: string;
  readonly flaws: string;
  readonly general_feedback: string;
  readonly km: number;
  readonly created_at: string;
};

type InternalPaginatedOwnerReview = {
  readonly itens: ReadonlyArray<InternalOwnerReview>;
  readonly limit: string;
  readonly page: string;
  readonly total: number;
};

type StringRanking = {
  readonly comfort: string;
  readonly cambium: string;
  readonly city_consumption: string;
  readonly road_consumption: string;
  readonly performance: string;
  readonly drivability: string;
  readonly internal_space: string;
  readonly stability: string;
  readonly brakes: string;
  readonly trunk: string;
  readonly suspension: string;
  readonly cost_benefit: string;
  readonly total_score: string;
};

type Ranking = {
  readonly id: string;
  readonly comfort: number;
  readonly cambium: number;
  readonly city_consumption: number;
  readonly road_consumption: number;
  readonly performance: number;
  readonly drivability: number;
  readonly internal_space: number;
  readonly stability: number;
  readonly brakes: number;
  readonly trunk: number;
  readonly suspension: number;
  readonly cost_benefit: number;
  readonly total_score: string;
  readonly created_at: string;
  readonly updated_at: string | null;
  readonly deleted_at: string | null;
};

type Engagement = {
  readonly id: string;
  readonly likes: number;
  readonly dislikes: number;
  readonly created_at: string;
  readonly updated_at: string | null;
};

type ExternalBrandInReviewListing = {
  readonly id: string;
  readonly name: string;
  readonly created_at: string;
  readonly updated_at: string | null;
  readonly deleted_at: string | null;
};

type ExternalModelInReviewListing = {
  readonly id: string;
  readonly name: string;
  readonly codModelBrand: string;
  readonly created_at: string;
  readonly updated_at: string | null;
  readonly deleted_at: string | null;
};

type ExternalVersionInReviewListing = {
  readonly id: string;
  readonly name: string;
  readonly brand_year: number;
  readonly model_year: number;
  readonly fipe_id: string;
  readonly created_at: string;
  readonly updated_at: string | null;
  readonly deleted_at: string | null;
};

type User = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly anonymous: boolean;
  readonly created_at: string;
  readonly updated_at: string | null;
  readonly deleted_at: string | null;
};

type FullReview = {
  readonly id: string;
  readonly owner_id: string;
  readonly license_plate: string;
  readonly ranking_id: string;
  readonly strengths: string;
  readonly cons: string;
  readonly flaws: string;
  readonly general_feedback: string;
  readonly km: number;
  readonly acquisition_year: number;
  readonly version_id: string;
  readonly created_at: string;
  readonly updated_at: string | null;
  readonly deleted_at: string | null;
  readonly ranking: Ranking;
  readonly engagement: Engagement;
  readonly brand: ExternalBrandInReviewListing;
  readonly model: ExternalModelInReviewListing;
  readonly version: ExternalVersionInReviewListing;
  readonly user: User;
  readonly averageScore: number;
};

type FullReviewV2 = {
  readonly id: string;
  readonly owner_id: string;
  readonly license_plate: string;
  readonly ranking_id: string;
  readonly strengths: string;
  readonly cons: string;
  readonly flaws: string;
  readonly general_feedback: string;
  readonly km: number;
  readonly acquisition_year: number;
  readonly version_id: string;
  readonly created_at: string;
  readonly updated_at: string | null;
  readonly deleted_at: string | null;
  readonly ranking: Ranking;
  readonly engagement: Engagement;
  readonly user: User;
  readonly averageScore: number;
};

type ReviewListResponse = {
  readonly itens: ReadonlyArray<FullReview>;
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
};

type ExternalVehicleBrandsListV2 = ReadonlyArray<{ readonly brandName: string }>;

type ExternalVehicleModelsListV2 = ReadonlyArray<{ readonly modelName: string }>;

type ExternalVehicleModelYearsListV2 = ReadonlyArray<{ readonly modelYear: number }>;

type ExternalVehicleDetailedModelListV2 = ReadonlyArray<{ readonly detailedModel: string }>;

type Unarray<Type> = Type extends ReadonlyArray<infer U> ? U : Type;

type ExternalVehiclePreview = {
  readonly model_name: string;
  readonly avg_total: number;
  readonly reviews_count: number;
  readonly brand_name: string;
  readonly codModelBrand: string;
};

type ExternalAverageRanking = {
  readonly comfort: number;
  readonly cambium: number;
  readonly city_consumption: number;
  readonly road_consumption: number;
  readonly performance: number;
  readonly drivability: number;
  readonly internal_space: number;
  readonly stability: number;
  readonly brakes: number;
  readonly trunk: number;
  readonly suspension: number;
  readonly cost_benefit: number;
  readonly total_score: number;
};

type ExternalVehicleAboutV2 = {
  readonly brandName: string;
  readonly modelName: string;
  readonly modelYear: number;
  readonly detailedModel: string;
  readonly hasAnyReviewWithLikes: boolean;
  readonly averageRanking: ExternalAverageRanking | null;
};

type ExternalVehicleAboutV3 = {
  readonly brandName: string;
  readonly modelName: string;
  readonly codModelBrand: string;
  readonly modelYear: number;
  readonly detailedModel: string;
  readonly hasAnyReviewWithLikes: boolean;
  readonly averageRanking: ExternalAverageRanking | null;
};

type ExternalVehicleVersion = {
  readonly id: string;
  readonly brand_id: string;
  readonly model_id: string;
  readonly brand_year: number;
  readonly model_year: number;
  readonly name: string;
  readonly fipe_id: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string;
};

export type ExternalVehicleParams = {
  readonly brandName: string;
  readonly modelName: string;
  readonly modelYear: number;
  readonly detailedModel: string;
};

@Injectable()
export class CarOwnerReviewService implements OwnerReviewService {
  private readonly _baseUrl: string;

  constructor(private readonly _httpService: HttpService, private readonly _envService: EnvService) {
    this._baseUrl = _envService.get(ENV_KEYS.OWNER_REVIEW_URL);
  }

  private static _parseOwnerReviewItem(item: InternalOwnerReview): OwnerReviewDto {
    return {
      plate: item.license_plate,
      owner: item.owner_id && {
        name: item.owner_id.name,
        email: item.owner_id.email,
        anonymous: item.owner_id.anonymous,
      },
      ranking: item.ranking_id && {
        comfort: item.ranking_id.comfort,
        cambium: item.ranking_id.cambium,
        cityConsumption: item.ranking_id.city_consumption,
        roadConsumption: item.ranking_id.road_consumption,
        performance: item.ranking_id.performance,
        drivability: item.ranking_id.drivability,
        internalSpace: item.ranking_id.internal_space,
        stability: item.ranking_id.stability,
        brakes: item.ranking_id.brakes,
        trunk: item.ranking_id.trunk,
        suspension: item.ranking_id.suspension,
        costBenefit: item.ranking_id.cost_benefit,
        totalScore: item.ranking_id.total_score,
      },
      strengths: item.strengths,
      cons: item.cons,
      flaws: item.flaws,
      generalFeedback: item.general_feedback,
      mileage: item.km,
      createdAt: item.created_at,
    };
  }

  private static _parseOwnerReviewItems(internal: InternalPaginatedOwnerReview): PaginationOf<OwnerReviewDto> {
    const items: ReadonlyArray<OwnerReviewDto> =
      internal?.itens?.map(CarOwnerReviewService._parseOwnerReviewItem) ?? [];
    return PaginationUtil.paginationFromListPage(
      items,
      parseInt(internal.page),
      parseInt(internal.limit),
      internal.total,
    );
  }

  async getOwnerReviews(
    brandModelCode: string,
    fipeId: string,
    page: number,
    perPage: number,
  ): Promise<PaginationOf<OwnerReviewDto>> {
    const url: string = `${this._baseUrl}/review/search-opinions?page=${page}&limit=${perPage}`;
    const codBrandModel: string = brandModelCode;
    const body: Record<string, unknown> = { codBrandModel, fipeId };
    const response$: Observable<AxiosResponse<InternalPaginatedOwnerReview>> = this._httpService.post(url, body);
    const response: AxiosResponse<InternalPaginatedOwnerReview> = await firstValueFrom(response$);
    return CarOwnerReviewService._parseOwnerReviewItems(response.data);
  }

  async anonymouslyEngage(reviewId: string, reaction: 'like' | 'dislike'): Promise<EngageResult> {
    const url: string = `${this._baseUrl}/engagement/review/${encodeURIComponent(reviewId)}`;
    const body: Record<string, unknown> = { reaction };
    const response$: Observable<AxiosResponse<EngageResult>> = this._httpService.put(url, body);
    const response: AxiosResponse<EngageResult> = await firstValueFrom(response$);
    return response.data;
  }

  async getAnonymouslyEngagement(reviewId: string): Promise<EngageResult> {
    const url: string = `${this._baseUrl}/engagement/review/${encodeURIComponent(reviewId)}`;
    const response$: Observable<AxiosResponse<EngageResult>> = this._httpService.get(url);
    const response: AxiosResponse<EngageResult> = await firstValueFrom(response$);
    return response.data;
  }

  async sendOwnerReview(carOwnerReviewDto: CarOwnerReviewDto): Promise<OwnerReviewDto> {
    const url: string = `${this._baseUrl}`;
    const response$: Observable<AxiosResponse<OwnerReviewDto>> = this._httpService.post(url, carOwnerReviewDto);
    const response: AxiosResponse<OwnerReviewDto> = await firstValueFrom(response$);
    return response.data;
  }

  async listPaginated(options: ReviewListOptions): Promise<PaginatedReviews> {
    const url: string = `${this._baseUrl}/v2/review/paginated`;
    const response$: Observable<AxiosResponse<ReviewListResponse>> = this._httpService.get(url, { params: options });
    const response: AxiosResponse<ReviewListResponse> = await firstValueFrom(response$);
    const data: ReviewListResponse = response.data;
    const items: ReadonlyArray<OwnerReviewFullDto> = data.itens.map(
      (review: FullReview): OwnerReviewFullDto => ({
        id: review.id,
        averageScore: review.averageScore,
        strengths: review.strengths,
        cons: review.cons,
        flaws: review.flaws,
        generalFeedback: review.general_feedback,
        km: review.km,
        createdAt: review.created_at,
        owner: {
          name: review.user.name,
        },
        ranking: {
          comfort: review.ranking.comfort,
          cambium: review.ranking.cambium,
          cityConsumption: review.ranking.city_consumption,
          roadConsumption: review.ranking.road_consumption,
          performance: review.ranking.performance,
          drivability: review.ranking.drivability,
          internalSpace: review.ranking.internal_space,
          stability: review.ranking.stability,
          brakes: review.ranking.brakes,
          trunk: review.ranking.trunk,
          suspension: review.ranking.suspension,
          costBenefit: review.ranking.cost_benefit,
          totalScore: Number(review.ranking.total_score),
        },
        engagement: {
          likes: review.engagement.likes,
          dislikes: review.engagement.dislikes,
        },
        brand: {
          name: review.brand.name,
        },
        model: {
          name: review.model.name,
          code: review.model.codModelBrand,
        },
        version: {
          fipeId: review.version.fipe_id,
          year: review.version.model_year,
        },
      }),
    );
    const result: PaginatedReviews = {
      totalPages: data.totalPages,
      amountInThisPage: items.length,
      currentPage: data.page,
      itemsPerPage: data.limit,
      nextPage: data.page < data.totalPages ? data.page + 1 : null,
      previousPage: data.page > 1 ? data.page - 1 : null,
      items,
      count: data.total,
    } as PaginatedReviews;
    return result;
  }

  async listPaginatedByVersion(options: ReviewListByVersionOptions): Promise<PaginatedReviewsV2> {
    const url: string = `${this._baseUrl}/v3/review/paginated`;
    const response$: Observable<AxiosResponse<ReviewListResponse>> = this._httpService.get(url, { params: options });
    const response: AxiosResponse<ReviewListResponse> = await firstValueFrom(response$);
    const data: ReviewListResponse = response.data;
    const items: ReadonlyArray<OwnerReviewFullV2Dto> = data.itens.map(
      (review: FullReviewV2): OwnerReviewFullV2Dto => ({
        id: review.id,
        averageScore: review.averageScore,
        strengths: review.strengths,
        cons: review.cons,
        flaws: review.flaws,
        generalFeedback: review.general_feedback,
        km: review.km,
        createdAt: review.created_at,
        owner: {
          name: review.user.name,
        },
        ranking: {
          comfort: review.ranking.comfort,
          cambium: review.ranking.cambium,
          cityConsumption: review.ranking.city_consumption,
          roadConsumption: review.ranking.road_consumption,
          performance: review.ranking.performance,
          drivability: review.ranking.drivability,
          internalSpace: review.ranking.internal_space,
          stability: review.ranking.stability,
          brakes: review.ranking.brakes,
          trunk: review.ranking.trunk,
          suspension: review.ranking.suspension,
          costBenefit: review.ranking.cost_benefit,
          totalScore: Number(review.ranking.total_score),
        },
        engagement: {
          likes: review.engagement.likes,
          dislikes: review.engagement.dislikes,
        },
      }),
    );
    const result: PaginatedReviews = {
      totalPages: data.totalPages,
      amountInThisPage: items.length,
      currentPage: data.page,
      itemsPerPage: data.limit,
      nextPage: data.page < data.totalPages ? data.page + 1 : null,
      previousPage: data.page > 1 ? data.page - 1 : null,
      items,
      count: data.total,
    } as PaginatedReviews;
    return result;
  }

  async listVehicleBrands(): Promise<VehicleBrandsList> {
    const url: string = `${this._baseUrl}/v2/vehicle/brands`;
    const response$: Observable<AxiosResponse<ExternalVehicleBrandsListV2>> = this._httpService.get(url);
    const response: AxiosResponse<ExternalVehicleBrandsListV2> = await firstValueFrom(response$);
    const data: ExternalVehicleBrandsListV2 = response.data;
    return {
      brands: data.map((brand: Unarray<ExternalVehicleBrandsListV2>) => ({
        name: brand.brandName,
      })),
    };
  }

  async listVehicleModels(brandName: string): Promise<VehicleModelsList> {
    const url: string = `${this._baseUrl}/v2/vehicle/brands/${encodeURIComponent(brandName)}/models`;
    const response$: Observable<AxiosResponse<ExternalVehicleModelsListV2>> = this._httpService.get(url);
    const response: AxiosResponse<ExternalVehicleModelsListV2> = await firstValueFrom(response$);
    const data: ExternalVehicleModelsListV2 = response.data;
    return {
      brand: brandName,
      models: data.map((model: Unarray<ExternalVehicleModelsListV2>) => ({ name: model.modelName })),
    };
  }

  async listVehicleModelYears(brandName: string, model: string): Promise<VehicleModelYearsList> {
    const url: string = `${this._baseUrl}/v2/vehicle/brands/${encodeURIComponent(
      brandName,
    )}/models/${encodeURIComponent(model)}/model-years`;
    const response$: Observable<AxiosResponse<ExternalVehicleModelYearsListV2>> = this._httpService.get(url);
    const response: AxiosResponse<ExternalVehicleModelYearsListV2> = await firstValueFrom(response$);
    const data: ExternalVehicleModelYearsListV2 = response.data;
    return {
      brand: brandName,
      model: model,
      modelYears: data.map((modelYear: Unarray<ExternalVehicleModelYearsListV2>) => ({
        year: modelYear.modelYear,
      })),
    };
  }

  async listVehicleDetailedModels(brandName: string, model: string, year: number): Promise<VehicleDetailedModelList> {
    const url: string = `${this._baseUrl}/v2/vehicle/brands/${encodeURIComponent(
      brandName,
    )}/models/${encodeURIComponent(model)}/model-years/${encodeURIComponent(year)}/detailed-model`;
    const response$: Observable<AxiosResponse<ExternalVehicleDetailedModelListV2>> = this._httpService.get(url);
    const response: AxiosResponse<ExternalVehicleDetailedModelListV2> = await firstValueFrom(response$);
    const data: ExternalVehicleDetailedModelListV2 = response.data;
    return {
      brand: brandName,
      model: model,
      modelYear: year,
      detailedModels: data.map((detailed: Unarray<ExternalVehicleDetailedModelListV2>) => ({
        detailedModel: detailed.detailedModel,
      })),
    };
  }

  async getReviewByFipeId(fipeId: string): Promise<RankingDto> {
    const url: string = `${this._baseUrl}/review/score/version/${fipeId}`;
    const response$: Observable<AxiosResponse<StringRanking>> = this._httpService.get(url);
    const response: AxiosResponse<StringRanking> = await firstValueFrom(response$);
    const data: StringRanking = response.data;
    return {
      comfort: Number(data.comfort),
      cambium: Number(data.cambium),
      cityConsumption: Number(data.city_consumption),
      roadConsumption: Number(data.road_consumption),
      performance: Number(data.performance),
      drivability: Number(data.drivability),
      internalSpace: Number(data.internal_space),
      stability: Number(data.stability),
      brakes: Number(data.brakes),
      trunk: Number(data.trunk),
      suspension: Number(data.suspension),
      costBenefit: Number(data.cost_benefit),
      totalScore: Number(data.total_score),
    };
  }

  async getVehicleInfoByBrandModelYear(
    brandName: string,
    modelName: string,
    year: number,
    detailedModel: string,
  ): Promise<VehicleBasicInfo> {
    const url: string = `${this._baseUrl}/v2/vehicle/brands/${encodeURIComponent(
      brandName,
    )}/models/${encodeURIComponent(modelName)}/model-years/${encodeURIComponent(
      year,
    )}/detailed-model/${encodeURIComponent(detailedModel)}/about`;
    const response$: Observable<AxiosResponse<ExternalVehicleAboutV2>> = this._httpService.get(url);
    const response: AxiosResponse<ExternalVehicleAboutV2> = await firstValueFrom(response$);
    const data: ExternalVehicleAboutV2 = response.data;
    return data
      ? {
          brandName: data.brandName,
          modelName: data.modelName,
          modelYear: data.modelYear,
          detailedModel: data.detailedModel,
          hasAnyReviewWithLikes: data.hasAnyReviewWithLikes,
          averageRanking: {
            comfort: data.averageRanking.comfort,
            cambium: data.averageRanking.cambium,
            cityConsumption: data.averageRanking.city_consumption,
            roadConsumption: data.averageRanking.road_consumption,
            performance: data.averageRanking.performance,
            drivability: data.averageRanking.drivability,
            internalSpace: data.averageRanking.internal_space,
            stability: data.averageRanking.stability,
            brakes: data.averageRanking.brakes,
            trunk: data.averageRanking.trunk,
            suspension: data.averageRanking.suspension,
            costBenefit: data.averageRanking.cost_benefit,
            totalScore: data.averageRanking.total_score,
          },
        }
      : null;
  }

  async getVehicleInfoByVersion(fipeId: string, yearModel?: number): Promise<VehicleBasicInfoByVersion> {
    const url: string = `${this._baseUrl}/v3/vehicle/versions/${encodeURIComponent(fipeId)}/about${
      typeof yearModel === 'number' ? '?modelYear=' + String(yearModel) : ''
    }`;
    const response$: Observable<AxiosResponse<ExternalVehicleAboutV3>> = this._httpService.get(url);
    const response: AxiosResponse<ExternalVehicleAboutV3> = await firstValueFrom(response$);
    const data: ExternalVehicleAboutV3 = response.data;
    return data
      ? {
          brandName: data.brandName,
          modelName: data.modelName,
          codModelBrand: data.codModelBrand,
          modelYear: data.modelYear,
          hasAnyReviewWithLikes: data.hasAnyReviewWithLikes,
          averageRanking: {
            comfort: data.averageRanking.comfort,
            cambium: data.averageRanking.cambium,
            cityConsumption: data.averageRanking.city_consumption,
            roadConsumption: data.averageRanking.road_consumption,
            performance: data.averageRanking.performance,
            drivability: data.averageRanking.drivability,
            internalSpace: data.averageRanking.internal_space,
            stability: data.averageRanking.stability,
            brakes: data.averageRanking.brakes,
            trunk: data.averageRanking.trunk,
            suspension: data.averageRanking.suspension,
            costBenefit: data.averageRanking.cost_benefit,
            totalScore: data.averageRanking.total_score,
          },
        }
      : null;
  }

  async listMostRatedVehicle(): Promise<ReadonlyArray<VehiclePreview>> {
    const url: string = `${this._baseUrl}/vehicle/models/paginated/`;
    const response$: Observable<AxiosResponse<ReadonlyArray<ExternalVehiclePreview>>> = this._httpService.get(url, {
      params: { sortBy: 'review-count', sortOrder: 'desc' },
    });
    const response: AxiosResponse<ReadonlyArray<ExternalVehiclePreview>> = await firstValueFrom(response$);
    const data: ReadonlyArray<ExternalVehiclePreview> = response.data;
    return (data || []).map((extPrev: ExternalVehiclePreview) => ({
      avgTotal: extPrev.avg_total,
      modelName: extPrev.model_name,
      reviewsCount: extPrev.reviews_count,
      brandName: extPrev.brand_name,
      codModelBrand: extPrev.codModelBrand,
    }));
  }

  async listVersionsByModel(codModel: string, year: number): Promise<ReadonlyArray<VehicleVersion>> {
    const url: string = `${this._baseUrl}/vehicle/models/${codModel}/model-year/${year}/versions`;
    const response$: Observable<AxiosResponse<ReadonlyArray<ExternalVehicleVersion>>> = this._httpService.get(url);
    const response: AxiosResponse<ReadonlyArray<ExternalVehicleVersion>> = await firstValueFrom(response$);
    const data: ReadonlyArray<ExternalVehicleVersion> = response.data;
    return data.map((version: ExternalVehicleVersion) => ({
      fipeId: version.fipe_id,
    }));
  }

  async findVehicleParamsByPlate(plate: string): Promise<VehicleParams> {
    const url: string = `${this._baseUrl}/vehicle/params?plate=${encodeURIComponent(plate)}`;
    const response$: Observable<AxiosResponse<ExternalVehicleParams>> = this._httpService.get(url);
    const response: AxiosResponse<ExternalVehicleParams> = await firstValueFrom(response$);
    const data: ExternalVehicleParams = response.data;
    if (!data) return null;
    return data;
  }

  async listAllPossibleVehicleOptions(): Promise<ReadonlyArray<VehicleSelectableOption>> {
    const url: string = `${this._baseUrl}/v2/vehicle/all-possible-options`;
    const response$: Observable<AxiosResponse<ReadonlyArray<VehicleSelectableOption>>> = this._httpService.get(url);
    const response: AxiosResponse<ReadonlyArray<VehicleSelectableOption>> = await firstValueFrom(response$);
    const data: ReadonlyArray<VehicleSelectableOption> = response.data;
    if (!data) return null;
    return data;
  }
}
