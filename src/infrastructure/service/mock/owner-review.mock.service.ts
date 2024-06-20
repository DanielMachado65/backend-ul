import {
  CarOwnerReviewDto,
  FullPaginatedReviewsDto,
  OwnerReviewDto,
  RankingDto,
} from 'src/domain/_layer/data/dto/owner-review.dto';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
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
} from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { EngageResult } from 'src/domain/support/owner-review/engage-owner-review.domain';
import { PaginatedReviews } from 'src/domain/support/owner-review/list-reviews.domain';

export class CarOwnerReviewMockService implements OwnerReviewService {
  listAllPossibleVehicleOptions(): Promise<readonly VehicleSelectableOption[]> {
    throw new Error('Method not implemented.');
  }

  findVehicleParamsByPlate(_plate: string): Promise<VehicleParams> {
    throw new Error('Method not implemented.');
  }

  getReviewByFipeId(_fipeId: string): Promise<RankingDto> {
    throw new Error('Method not implemented.');
  }

  sendOwnerReview(_keys: CarOwnerReviewDto): Promise<OwnerReviewDto> {
    throw new Error('Method not implemented.');
  }

  getOwnerReviews(
    _brandModelCode: string,
    _fipeId: string,
    _page: number,
    _perPage: number,
  ): Promise<PaginationOf<OwnerReviewDto>> {
    throw new Error('Method not implemented.');
  }

  anonymouslyEngage(_reviewId: string, _reaction: 'like' | 'dislike'): Promise<EngageResult> {
    throw new Error('Method not implemented.');
  }

  getAnonymouslyEngagement(_reviewId: string): Promise<EngageResult> {
    throw new Error('Method not implemented.');
  }

  listPaginated(_options: ReviewListOptions): Promise<PaginatedReviews> {
    throw new Error('Method not implemented.');
  }

  listVehicleBrands(): Promise<VehicleBrandsList> {
    throw new Error('Method not implemented.');
  }

  listVehicleModels(_brandName: string): Promise<VehicleModelsList> {
    throw new Error('Method not implemented.');
  }

  listVehicleModelYears(_brandName: string, _model: string): Promise<VehicleModelYearsList> {
    throw new Error('Method not implemented.');
  }

  listVehicleDetailedModels(_brandName: string, _model: string, _year: number): Promise<VehicleDetailedModelList> {
    throw new Error('Method not implemented.');
  }

  getVehicleInfoByBrandModelYear(_brandName: string, _codModel: string, _year: number): Promise<VehicleBasicInfo> {
    throw new Error('Method not implemented.');
  }

  getVehicleInfoByVersion(_fipeId: string): Promise<VehicleBasicInfoByVersion> {
    throw new Error('Method not implemented.');
  }

  listMostRatedVehicle(): Promise<readonly VehiclePreview[]> {
    throw new Error('Method not implemented.');
  }

  listVersionsByModel(_codModel: string, _year: number): Promise<readonly VehicleVersion[]> {
    throw new Error('Method not implemented.');
  }

  listPaginatedByVersion(_options: ReviewListByVersionOptions): Promise<FullPaginatedReviewsDto> {
    throw new Error('Method not implemented.');
  }
}
