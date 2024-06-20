import { Module, Provider } from '@nestjs/common';
import { EngageOwnerReviewDomain } from 'src/domain/support/owner-review/engage-owner-review.domain';
import { FindVehicleParamsDomain } from 'src/domain/support/owner-review/find-vehicle-params.domain';
import { GetOwnerReviewQueryDomain } from 'src/domain/support/owner-review/get-owner-review-query.domain';
import { GetReviewEngagementDomain } from 'src/domain/support/owner-review/get-review-engagement.domain';
import { GetReviewForFipeDomain } from 'src/domain/support/owner-review/get-review-for-fipe.domain';
import { GetVehicleAboutDataDomain } from 'src/domain/support/owner-review/get-vehicle-basic-data.domain';
import { ListAllPossibleOptionsDomain } from 'src/domain/support/owner-review/list-all-possible-options.domain';
import { ListMostRatedVehiclesDomain } from 'src/domain/support/owner-review/list-most-rated-vehicles.domain';
import { ListReviewsDomain } from 'src/domain/support/owner-review/list-reviews.domain';
import { ListVehicleBrandsDomain } from 'src/domain/support/owner-review/list-vehicle-brands.domain';
import { ListVehicleDetailedModelsDomain } from 'src/domain/support/owner-review/list-vehicle-detailed-models.domain';
import { ListVehicleModelYearsDomain } from 'src/domain/support/owner-review/list-vehicle-model-year.domain';
import { ListVehicleModelsDomain } from 'src/domain/support/owner-review/list-vehicle-models.domain';
import { ListVehicleVersionsDomain } from 'src/domain/support/owner-review/list-vehicle-versions.domain';
import { RequestOwnerReviewQueryDomain } from 'src/domain/support/owner-review/request-owner-review-query.domain';
import { RequestReviewDomain } from 'src/domain/support/owner-review/request-review.domain';
import { SaveReceivedReviewDatasheetQueryDomain } from 'src/domain/support/owner-review/save-received-review-datasheet-query.domain';
import { SendOwnerReviewDomain } from 'src/domain/support/owner-review/send-owner-reviews.domain';
import { GetOwnerReviewsDomain } from '../../../domain/support/owner-review/get-owner-reviews.domain';
import { EngageOwnerReviewUseCase } from './engage-owner-review.use-case';
import { FindVehicleParamsUseCase } from './find-vehicle-params.use-case';
import { GetOwnerReviewQueryUseCase } from './get-owner-review-query.use-case';
import { GetOwnerReviewsUseCase } from './get-owner-reviews.use-case';
import { GetReviewEngagementUseCase } from './get-review-engagement.use-case';
import { GetReviewForFipeUseCase } from './get-review-for-fipe.use-case';
import { GetVehicleAboutDataUseCase } from './get-vehicle-about-data.use-case';
import { ListAllPossibleOptionsUseCase } from './list-all-possible-options.use-case';
import { ListMostRatedVehiclesUseCase } from './list-most-rated-vehicles.use-case';
import { ListReviewsUseCase } from './list-reviews.use-case';
import { ListVehicleBrandsUseCase } from './list-vehicle-brands.use-case';
import { ListVehicleDetailedModelsUseCase } from './list-vehicle-detailed-models.use-case';
import { ListVehicleModelYearsUseCase } from './list-vehicle-model-year.use-case';
import { ListVehicleModelsUseCase } from './list-vehicle-models.use-case';
import { ListVehicleVersionsUseCase } from './list-vehicle-versions.use-case';
import { RequestOwnerReviewQueryUseCase } from './request-owner-review-query.use-case';
import { RequestReviewUseCase } from './request-review.use-case';
import { SaveReceivedReviewDatasheetQueryUseCase } from './save-received-review-datasheet-query.use-case';
import { SendOwnerReviewUseCase } from './send-owner-review.use-case';
import { SitemapJobUseCase } from './sitemap-job.use-case';

const providers: ReadonlyArray<Provider> = [
  {
    provide: GetOwnerReviewsDomain,
    useClass: GetOwnerReviewsUseCase,
  },
  {
    provide: SendOwnerReviewDomain,
    useClass: SendOwnerReviewUseCase,
  },
  {
    provide: EngageOwnerReviewDomain,
    useClass: EngageOwnerReviewUseCase,
  },
  {
    provide: GetReviewEngagementDomain,
    useClass: GetReviewEngagementUseCase,
  },
  {
    provide: ListReviewsDomain,
    useClass: ListReviewsUseCase,
  },
  {
    provide: ListVehicleBrandsDomain,
    useClass: ListVehicleBrandsUseCase,
  },
  {
    provide: ListVehicleModelsDomain,
    useClass: ListVehicleModelsUseCase,
  },
  {
    provide: ListVehicleModelYearsDomain,
    useClass: ListVehicleModelYearsUseCase,
  },
  {
    provide: GetReviewForFipeDomain,
    useClass: GetReviewForFipeUseCase,
  },
  {
    provide: RequestOwnerReviewQueryDomain,
    useClass: RequestOwnerReviewQueryUseCase,
  },
  {
    provide: GetOwnerReviewQueryDomain,
    useClass: GetOwnerReviewQueryUseCase,
  },
  {
    provide: SaveReceivedReviewDatasheetQueryDomain,
    useClass: SaveReceivedReviewDatasheetQueryUseCase,
  },
  {
    provide: GetVehicleAboutDataDomain,
    useClass: GetVehicleAboutDataUseCase,
  },
  {
    provide: ListMostRatedVehiclesDomain,
    useClass: ListMostRatedVehiclesUseCase,
  },
  {
    provide: ListVehicleDetailedModelsDomain,
    useClass: ListVehicleDetailedModelsUseCase,
  },
  {
    provide: FindVehicleParamsDomain,
    useClass: FindVehicleParamsUseCase,
  },
  {
    provide: ListAllPossibleOptionsDomain,
    useClass: ListAllPossibleOptionsUseCase,
  },
  {
    provide: ListVehicleVersionsDomain,
    useClass: ListVehicleVersionsUseCase,
  },
  {
    provide: RequestReviewDomain,
    useClass: RequestReviewUseCase,
  },
  SitemapJobUseCase,
];

@Module({
  imports: [],
  controllers: [],
  providers: [...providers],
  exports: [...providers],
})
export class OwnerReviewDataLayerModule {}
