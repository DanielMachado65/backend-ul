import { Module, Provider } from '@nestjs/common';

import { ConfigureAlertFipePriceDomain } from 'src/domain/core/product/configure-alert-fipe-price.domain';
import { ConfigureAlertOnQueryDomain } from 'src/domain/core/product/configure-alert-on-query.domain';
import { ExcludeProductBoughtDomain } from 'src/domain/core/product/exclude-bought-product.domain';
import { GetAlertFipePriceConfigDomain } from 'src/domain/core/product/get-alert-fipe-price-config.domain.';
import { GetAlertOnQueryConfigDomain } from 'src/domain/core/product/get-alert-on-query-config.domain';
import { GetBoughtProductDomain } from 'src/domain/core/product/get-bought-product.domain';
import { GetCreditPacksDomain } from 'src/domain/core/product/get-credit-packs.domain';
import { GetPlanAvailabilityDomain } from 'src/domain/core/product/get-plan-availability.domain';
import { ListAllBoughtProductDomain } from 'src/domain/core/product/list-all-bought-product.domain';
import { QueryDatasheetDomain } from 'src/domain/core/product/query-datasheet.domain';
import { QueryFinesDomain } from 'src/domain/core/product/query-fines.domain';
import { QueryFipePriceDomain } from 'src/domain/core/product/query-fipe-price.domain';
import { QueryInsuranceQuoteDomain } from 'src/domain/core/product/query-insurance-quote.domain';
import { QueryMainFlawsDomain } from 'src/domain/core/product/query-main-flaws.domain';
import { QueryOwnerReviewDomain } from 'src/domain/core/product/query-owner-review.domain';
import { QueryPartsAndValuesDomain } from 'src/domain/core/product/query-parts-and-values.domain';
import { QueryRevisionPlanDomain } from 'src/domain/core/product/query-revision-plan.domain';
import { RegisterMyCarDomain } from 'src/domain/core/product/register-my-car.domain';
import { SendAlertFipePriceDomain } from 'src/domain/core/product/send-alert-fipe-price.domain';
import { SendAlertOnQueryDomain } from 'src/domain/core/product/send-alert-on-query.domain';
import { UpgradeMyCarProductToPremiumDomain } from 'src/domain/core/product/upgrade-my-car-product-to-premium.domain';
import { ConfigureAlertFipePriceUseCase } from './configure-alert-fipe-price.use-case';
import { ConfigureAlertOnQueryUseCase } from './configure-alert-on-query.use-case';
import { ExcludeProductUseCase } from './exclude-bought-product.use-case';
import { GetAlertFipePriceConfigUseCase } from './get-alert-fipe-price-config.use-case';
import { GetAlertOnQueryConfigUseCase } from './get-alert-on-query-config-use-case';
import { GetBoughtProductUseCase } from './get-bought-product.use-case';
import { GetCreditPacksUseCase } from './get-credit-packs.use-case';
import { GetPlanAvailabilityUseCase } from './get-plan-availability.use-case';
import { ListAllBoughtProductUseCase } from './list-all-bought-product.use-case';
import { MyCarsQueryHelper } from './my-cars-query.helper';
import { PlanAvailabilityHelper } from './plan-availability.helper';
import { QueryDatasheetUseCase } from './query-datasheet.use-case';
import { QueryFinesUseCase } from './query-fines.use-case';
import { QueryFipePriceUseCase } from './query-fipe-price.use-case';
import { QueryInsuranceQuoteUseCase } from './query-insurance-quote.use-case';
import { QueryMainFlawsUseCase } from './query-main-flaws.use-case';
import { QueryOwnerReviewUseCase } from './query-owner-review.use-case';
import { QueryPartsAndValuesUseCase } from './query-parts-and-values.use-case';
import { QueryRevisionPlanUseCase } from './query-revision-plan.use-case';
import { RegisterMyCarUseCase } from './register-my-car.use-case';
import { SendAlertFipePriceUseCase } from './send-alert-fipe-price.use-case';
import { SendAlertOnQueryUseCase } from './send-alert-on-query.use-case';
import { UpgradeMyCarProductToPremiumUseCase } from './upgrade-my-car-product-to-premium.use-case';
import { ConfigureAlertRevisionDomain } from 'src/domain/core/product/configure-alert-revision.domain';
import { ConfigureAlertRevisionUseCase } from './configure-alert-revision.use-case';
import { GetAttributesMyCarProductDomain } from 'src/domain/core/product/get-attributes-alert-config.domain';
import { GetAttributesMyCarProductUseCase } from './get-attributes-my-car-product-use.case';
import { SendAlertRevisionPlanUseCase } from './send-alert-revision-plan.use-case';
import { DispatchNotificationDomain } from 'src/domain/core/product/dispatch-notification.domain';
import { DispatchNotificationUseCase } from './dispatch-notification.use-case';
import { SendAlertRevisionPlanDomain } from 'src/domain/core/product/send-alert-revision-plan.domain';
import { ConfigureAlertFineDomain } from 'src/domain/core/product/configure-alert-fine.domain';
import { ConfigureAlertFineUseCase } from './configure-alert-fine.use-case';
import { SendAlertFineDomain } from 'src/domain/core/product/send-alert-fine.domain';
import { SendAlertFineUseCase } from './send-alert-fine.use-case';
import { GetRevisionConfigMyCarProductDomain } from 'src/domain/core/product/get-alert-revision-plan-config.domain';
import { GetRevisionConfigMyCarProductUseCase } from './get-revision-config-my-car-product-use.case';
import { GetFineMyCarProductDomain } from 'src/domain/core/product/get-alert-fine-config.domain';
import { GetFineConfigMyCarProductUseCase } from './get-fine-config-my-car-product-use.case';
import { QueryFinesHelper } from './helpers/query-fines.helper';
import { SharedModule } from 'src/data/shared/shared.module';

const providers: ReadonlyArray<Provider> = [
  { provide: GetCreditPacksDomain, useClass: GetCreditPacksUseCase },
  { provide: ExcludeProductBoughtDomain, useClass: ExcludeProductUseCase },
  { provide: GetBoughtProductDomain, useClass: GetBoughtProductUseCase },
  { provide: ListAllBoughtProductDomain, useClass: ListAllBoughtProductUseCase },
  { provide: RegisterMyCarDomain, useClass: RegisterMyCarUseCase },
  { provide: UpgradeMyCarProductToPremiumDomain, useClass: UpgradeMyCarProductToPremiumUseCase },
  { provide: QueryDatasheetDomain, useClass: QueryDatasheetUseCase },
  { provide: QueryFinesDomain, useClass: QueryFinesUseCase },
  { provide: QueryFipePriceDomain, useClass: QueryFipePriceUseCase },
  { provide: QueryInsuranceQuoteDomain, useClass: QueryInsuranceQuoteUseCase },
  { provide: QueryMainFlawsDomain, useClass: QueryMainFlawsUseCase },
  { provide: QueryOwnerReviewDomain, useClass: QueryOwnerReviewUseCase },
  { provide: QueryPartsAndValuesDomain, useClass: QueryPartsAndValuesUseCase },
  { provide: QueryRevisionPlanDomain, useClass: QueryRevisionPlanUseCase },
  { provide: GetPlanAvailabilityDomain, useClass: GetPlanAvailabilityUseCase },
  { provide: ConfigureAlertRevisionDomain, useClass: ConfigureAlertRevisionUseCase },
  { provide: ConfigureAlertOnQueryDomain, useClass: ConfigureAlertOnQueryUseCase },
  { provide: ConfigureAlertFineDomain, useClass: ConfigureAlertFineUseCase },
  { provide: GetAttributesMyCarProductDomain, useClass: GetAttributesMyCarProductUseCase },
  { provide: DispatchNotificationDomain, useClass: DispatchNotificationUseCase },
  { provide: SendAlertRevisionPlanDomain, useClass: SendAlertRevisionPlanUseCase },
  { provide: GetAlertOnQueryConfigDomain, useClass: GetAlertOnQueryConfigUseCase },
  { provide: SendAlertOnQueryDomain, useClass: SendAlertOnQueryUseCase },
  { provide: SendAlertFineDomain, useClass: SendAlertFineUseCase },
  { provide: GetAlertOnQueryConfigDomain, useClass: GetAlertOnQueryConfigUseCase },
  { provide: ConfigureAlertFipePriceDomain, useClass: ConfigureAlertFipePriceUseCase },
  { provide: GetAlertFipePriceConfigDomain, useClass: GetAlertFipePriceConfigUseCase },
  { provide: SendAlertFipePriceDomain, useClass: SendAlertFipePriceUseCase },
  { provide: GetRevisionConfigMyCarProductDomain, useClass: GetRevisionConfigMyCarProductUseCase },
  { provide: GetFineMyCarProductDomain, useClass: GetFineConfigMyCarProductUseCase },
];

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [...providers, MyCarsQueryHelper, PlanAvailabilityHelper, QueryFinesHelper],
  exports: [...providers],
})
export class ProductDataLayerModule {}
