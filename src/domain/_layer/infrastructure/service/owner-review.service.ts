import { EngageResult } from 'src/domain/support/owner-review/engage-owner-review.domain';
import { CarOwnerReviewDto, OwnerReviewDto, RankingDto } from '../../data/dto/owner-review.dto';
import { PaginationOf } from '../../data/dto/pagination.dto';
import { PaginatedReviews, PaginatedReviewsV2 } from 'src/domain/support/owner-review/list-reviews.domain';
import { VehicleBrandEntity } from 'src/domain/_entity/vehicle-brand.entity';
import { VehicleModelEntity } from 'src/domain/_entity/vehicle-model.entity';
import { VehicleModelYearEntity } from 'src/domain/_entity/vehicle-model-year.entity';
import { VehicleDetailedModelEntity } from 'src/domain/_entity/vehicle-detailed-model.entity';

export enum ReviewListSortBy {
  RATE = 'rate',
  DATE = 'date',
  AVG_SCORE = 'avg_score',
  KM = 'km',
}

export enum ReviewListOrderBy {
  ASC = 'asc',
  DESC = 'desc',
}

export type ReviewListOptions = {
  readonly brandName: string;
  readonly modelName: string;
  readonly yearModel: number;
  readonly detailedModel: string;
  readonly sortBy?: ReviewListSortBy;
  readonly orderBy?: ReviewListOrderBy;
  readonly page: number;
  readonly perPage: number;
};

export type ReviewListByVersionOptions = {
  readonly fipeId: string;
  readonly modelYear?: number;
  readonly sortBy?: ReviewListSortBy;
  readonly orderBy?: ReviewListOrderBy;
  readonly page: number;
  readonly perPage: number;
};

export type VehicleBrandsList = {
  readonly brands: ReadonlyArray<Omit<VehicleBrandEntity, 'image'>>;
};

export type VehicleModelsList = {
  readonly brand: string;
  readonly models: ReadonlyArray<VehicleModelEntity>;
};

export type VehicleModelYearsList = {
  readonly brand: string;
  readonly model: string;
  readonly modelYears: ReadonlyArray<VehicleModelYearEntity>;
};

export type VehicleDetailedModelList = {
  readonly brand: string;
  readonly model: string;
  readonly modelYear: number;
  readonly detailedModels: ReadonlyArray<VehicleDetailedModelEntity>;
};

export type VehicleBasicInfo = {
  readonly brandName: string;
  readonly modelName: string;
  readonly modelYear: number;
  readonly detailedModel: string;
  readonly hasAnyReviewWithLikes: boolean;
  readonly averageRanking: RankingDto;
};

export type VehicleBasicInfoByVersion = {
  readonly brandName: string;
  readonly modelName: string;
  readonly codModelBrand: string;
  readonly modelYear: number;
  readonly hasAnyReviewWithLikes: boolean;
  readonly averageRanking: RankingDto;
};

export type VehiclePreview = {
  readonly modelName: string;
  readonly avgTotal: number;
  readonly reviewsCount: number;
  readonly brandName: string;
  readonly codModelBrand: string;
};

export type VehicleParams = {
  readonly brandName: string;
  readonly modelName: string;
  readonly modelYear: number;
  readonly detailedModel: string;
};

export type VehicleVersion = {
  readonly fipeId: string;
};

export type VehicleSelectableOption = {
  readonly brandName: string;
  readonly modelName: string;
  readonly modelYear: number;
  readonly detailedModel: string;
};

export abstract class OwnerReviewService {
  abstract getOwnerReviews(
    brandModelCode: string,
    fipeId: string,
    page: number,
    perPage: number,
  ): Promise<PaginationOf<OwnerReviewDto>>;

  abstract anonymouslyEngage(reviewId: string, reaction: 'like' | 'dislike'): Promise<EngageResult>;

  abstract getAnonymouslyEngagement(reviewId: string): Promise<EngageResult>;

  abstract listPaginated(options: ReviewListOptions): Promise<PaginatedReviews>;

  abstract listPaginatedByVersion(options: ReviewListByVersionOptions): Promise<PaginatedReviewsV2>;

  abstract listVehicleBrands(): Promise<VehicleBrandsList>;

  abstract listVehicleModels(brandName: string): Promise<VehicleModelsList>;

  abstract listVehicleModelYears(brandName: string, model: string): Promise<VehicleModelYearsList>;

  abstract listVehicleDetailedModels(brandName: string, model: string, year: number): Promise<VehicleDetailedModelList>;

  abstract getReviewByFipeId(fipeId: string): Promise<RankingDto>;

  abstract getVehicleInfoByBrandModelYear(
    brandName: string,
    modelName: string,
    year: number,
    detailedModel: string,
  ): Promise<VehicleBasicInfo>;

  abstract sendOwnerReview(carOwnerReviewDto: CarOwnerReviewDto): Promise<OwnerReviewDto>;

  abstract getVehicleInfoByVersion(fipeId: string, yearModel?: number): Promise<VehicleBasicInfoByVersion>;

  abstract listMostRatedVehicle(): Promise<ReadonlyArray<VehiclePreview>>;

  abstract listVersionsByModel(codModel: string, year: number): Promise<ReadonlyArray<VehicleVersion>>;

  abstract findVehicleParamsByPlate(plate: string): Promise<VehicleParams>;

  abstract listAllPossibleVehicleOptions(): Promise<ReadonlyArray<VehicleSelectableOption>>;
}
