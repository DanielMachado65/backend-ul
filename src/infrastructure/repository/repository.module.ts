import { Global, Module, Provider } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { ENV_KEYS, EnvService } from '../framework/env.service';

import { mBalanceModelDef } from '../model/balance.model';
import { mBillingModelDef } from '../model/billing.model';
import { mCarRevendorModelDef } from '../model/car-revendor.model';
import { mCompanyModelDef } from '../model/company.model';
import { mConsumptionStatementModelDef } from '../model/consumption-statement.model';
import { mCouponModelDef } from '../model/coupon.model';
import { mFaqModelDef } from '../model/faq.model';
import { mFeedbackModelDef } from '../model/feedback.model';
import { mInvoiceModelDef } from '../model/invoice.model';
import { mLogModelDef } from '../model/log.model';
import { mMyCarProductModelDef } from '../model/my-car-product.model';
import { mPackageModelDef } from '../model/package.model';
import { mPartnerIncomingModelDef } from '../model/partner-incoming.model';
import { mPartnerModelDef } from '../model/partner.model';
import { mPaymentModelDef } from '../model/payment.model';
import { mPermissionsModelDef } from '../model/permissions.model';
import { mPlanModelDef } from '../model/plan.model';
import { mPriceTableModelDef } from '../model/price-table.model';
import { mQueryComposerModelDef } from '../model/query-composer.model';
import { mQueryInfoModelDef } from '../model/query-info.model';
import { mQueryMapperModelDef } from '../model/query-mapper.model';
import { mQueryRulesModelDef } from '../model/query-rules.model';
import { mQueryModelDef } from '../model/query.model';
import { mServiceLogModelDef } from '../model/service-log.model';
import { mServiceModelDef } from '../model/service.model';
import { mSubscriptionModelDef } from '../model/subscription.model';
import { mTermModelDef } from '../model/term.model';
import { mTestDriveQueryModelDef } from '../model/test-drive-query.model';
import { mTestimonialModelDef } from '../model/testimonial.model';
import { mUserModelDef } from '../model/user.model';
import { mVersionAppControlDef } from '../model/version-app-control.model';

import { CarRevendorRepository } from 'src/domain/_layer/infrastructure/repository/car-revendor.repository';
import { CityZipCodeRepository } from 'src/domain/_layer/infrastructure/repository/city-zipcode.repository';
import { CompanyRepository } from 'src/domain/_layer/infrastructure/repository/company.repository';
import { CouponRepository } from 'src/domain/_layer/infrastructure/repository/coupon.repository';
import { CreditQueryRepository } from 'src/domain/_layer/infrastructure/repository/credit-query.repository';
import { FaqRepository } from 'src/domain/_layer/infrastructure/repository/faq.repository';
import { HttpLogRepository } from 'src/domain/_layer/infrastructure/repository/http-log.repository';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { OwnerReviewModelRepository } from 'src/domain/_layer/infrastructure/repository/owner-review-model.repository';
import { PackageRepository } from 'src/domain/_layer/infrastructure/repository/package.repository';
import { PaymentManagementRepository } from 'src/domain/_layer/infrastructure/repository/payment-managament.repository';
import { PaymentRepository } from 'src/domain/_layer/infrastructure/repository/payment.repository';
import { PlanRepository } from 'src/domain/_layer/infrastructure/repository/plan.repository';
import { QueryInfoRepository } from 'src/domain/_layer/infrastructure/repository/query-info.repository';
import { SpanLogRepository } from 'src/domain/_layer/infrastructure/repository/span-log.repository';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { TestimonialRepository } from 'src/domain/_layer/infrastructure/repository/testimonial.repository';
import { TotalTestDriveRepository } from 'src/domain/_layer/infrastructure/repository/total-test-drive.repository';
import { VersionAppControlRepository } from 'src/domain/_layer/infrastructure/repository/version-app-control';
import { mCityZipCodesModelDef } from 'src/infrastructure/model/city-zipcode.model';
import { CreditQueryRedisRepository } from 'src/infrastructure/repository/query/credit-query.redis.repository';
import { CityZipCodeMongoRepository } from 'src/infrastructure/repository/zipcode/city-zipcode.mongo.repository';
import { BalanceRepository } from '../../domain/_layer/infrastructure/repository/balance.repository';
import { BillingRepository } from '../../domain/_layer/infrastructure/repository/billing.repository';
import { ConsumptionStatementRepository } from '../../domain/_layer/infrastructure/repository/consumption-statement.repository';
import { FeedbackQueryRepository } from '../../domain/_layer/infrastructure/repository/feedback-query.repository';
import { InvoiceRepository } from '../../domain/_layer/infrastructure/repository/invoice.repository';
import { NfeRepository } from '../../domain/_layer/infrastructure/repository/nfe.repository';
import { PartnerIncomingRepository } from '../../domain/_layer/infrastructure/repository/partner-incoming.repository';
import { PriceTableRepository } from '../../domain/_layer/infrastructure/repository/price-table.repository';
import { QueryComposerRepository } from '../../domain/_layer/infrastructure/repository/query-composer.repository';
import { QueryLogRepository } from '../../domain/_layer/infrastructure/repository/query-log.repository';
import { QueryRepository } from '../../domain/_layer/infrastructure/repository/query.repository';
import { ServiceLogRepository } from '../../domain/_layer/infrastructure/repository/service-log.repository';
import { ServiceRepository } from '../../domain/_layer/infrastructure/repository/service.repository';
import { TestDriveQueryRepository } from '../../domain/_layer/infrastructure/repository/test-drive-query.repository';
import { UserRepository } from '../../domain/_layer/infrastructure/repository/user.repository';
import { mHttpLogModelDef } from '../model/http-log.model';
import { mNfeModelDef } from '../model/nfe.model';
import { mPaymentsManagementModelDef } from '../model/payment-management.model';
import { mSpanLogModelDef } from '../model/span-log.model';
import { mTotalTestDriveModelDef } from '../model/total-test-drive.model';
import { RedisManagerModule } from './_redis/redis-manager.module';
import { BalanceMongoRepository } from './billing/balance.mongo.repository';
import { BillingMongoRepository } from './billing/billing.mongo.repository';
import { ConsumptionStatementMongoRepository } from './billing/consumption-statement.mongo.repository';
import { CouponMongoRepository } from './billing/coupon.mongo.repository';
import { InvoiceMongoRepository } from './billing/invoice.mongo.repository';
import { NfeMongoRepository } from './billing/nfe.mongo.repository';
import { PaymentManagementMongoRepository } from './billing/payment-management.mongo.repository';
import { PaymentMongoRepository } from './billing/payment.mongo.repository';
import { PlanMongoRepository } from './billing/plan.mongo.repository';
import { PriceTableMongoRepository } from './billing/price-table.mongo.repository';
import { SubscriptionMongoRepository } from './billing/subscription.mongo.repository';
import { CompanyMongoRepository } from './company/company.mongo.repository';
import { FaqMongoRepository } from './company/faq.mongo.repository';
import { QueryInfoMongoRepository } from './company/query-info.mongo.repository';
import { TestimonialMongoRepository } from './company/testimonial.mongo.repository';
import { FeedbackQueryMongoRepository } from './feedback/feedback.mongo.repository';
import { HttpLogMongoRepository } from './infra/http-log.mongo.repository';
import { SpanLogMongoRepository } from './infra/span-log.mongo.repository';
import { OwnerReviewModelRedisRepository } from './owner-review/owner-review-model.redis.repository';
import { PartnerIncomingMongoRepository } from './partner/partner-incoming.mongo.repository';
import { MyCarProductMongoRepository } from './product/my-car-product.mongo.repository';
import { PackageMongoRepository } from './product/package.mongo.repository';
import { QueryComposerMongoRepository } from './query/query-composer.mongo.repository';
import { QueryLogMongoRepository } from './query/query-log.mongo.repository';
import { QueryMongoRepository } from './query/query.mongo.repository';
import { ServiceLogMongoRepository } from './query/service-log.mongo.repository';
import { ServiceMongoRepository } from './query/service.mongo.repository';
import { TestDriveQueryMongoRepository } from './query/test-drive-query.mongo.repository';
import { TotalTestDriveMongoRepository } from './query/total-test-drive.mongo.repository';
import { TransactionHelper } from './transaction.helper';
import { TransactionMongoHelper } from './transaction.mongo.helper';
import { CarRevendorMongoRepository } from './user/car-revendor.mongo.repository';
import { UserMongoRepository } from './user/user.mongo.repository';
import { VersionAppControlMongoRepository } from './version-app-control/version-app-control.mongo.repository';
import { AnalyticsMongoRepository } from './user/analytics.mongo.repository';
import { AnalyticsRepository } from 'src/domain/_layer/infrastructure/repository/analytics.repository';
import { mAnalyticsModelDef } from '../model/analytics.model';

const modelDefinitions: ReadonlyArray<ModelDefinition> = [
  mBalanceModelDef,
  mBillingModelDef,
  mConsumptionStatementModelDef,
  mCouponModelDef,
  mFaqModelDef,
  mFeedbackModelDef,
  mHttpLogModelDef,
  mInvoiceModelDef,
  mLogModelDef,
  mPackageModelDef,
  mPartnerModelDef,
  mPartnerIncomingModelDef,
  mPaymentModelDef,
  mPermissionsModelDef,
  mPlanModelDef,
  mPriceTableModelDef,
  mQueryModelDef,
  mQueryComposerModelDef,
  mQueryInfoModelDef,
  mQueryMapperModelDef,
  mQueryRulesModelDef,
  mServiceModelDef,
  mServiceLogModelDef,
  mSubscriptionModelDef,
  mTermModelDef,
  mTestDriveQueryModelDef,
  mTestimonialModelDef,
  mUserModelDef,
  mCompanyModelDef,
  mCityZipCodesModelDef,
  mNfeModelDef,
  mCarRevendorModelDef,
  mPaymentsManagementModelDef,
  mMyCarProductModelDef,
  mVersionAppControlDef,
  mTotalTestDriveModelDef,
  mSpanLogModelDef,
  mAnalyticsModelDef,
];

const repositoryProviders: ReadonlyArray<Provider> = [
  { provide: TransactionHelper, useClass: TransactionMongoHelper },
  { provide: BalanceRepository, useClass: BalanceMongoRepository },
  { provide: BillingRepository, useClass: BillingMongoRepository },
  { provide: PriceTableRepository, useClass: PriceTableMongoRepository },
  { provide: InvoiceRepository, useClass: InvoiceMongoRepository },
  { provide: UserRepository, useClass: UserMongoRepository },
  { provide: QueryComposerRepository, useClass: QueryComposerMongoRepository },
  { provide: ServiceRepository, useClass: ServiceMongoRepository },
  { provide: QueryRepository, useClass: QueryMongoRepository },
  { provide: QueryLogRepository, useClass: QueryLogMongoRepository },
  { provide: ServiceLogRepository, useClass: ServiceLogMongoRepository },
  { provide: ConsumptionStatementRepository, useClass: ConsumptionStatementMongoRepository },
  { provide: FeedbackQueryRepository, useClass: FeedbackQueryMongoRepository },
  { provide: HttpLogRepository, useClass: HttpLogMongoRepository },
  { provide: PaymentRepository, useClass: PaymentMongoRepository },
  { provide: TestDriveQueryRepository, useClass: TestDriveQueryMongoRepository },
  { provide: PackageRepository, useClass: PackageMongoRepository },
  { provide: CouponRepository, useClass: CouponMongoRepository },
  { provide: CompanyRepository, useClass: CompanyMongoRepository },
  { provide: PartnerIncomingRepository, useClass: PartnerIncomingMongoRepository },
  { provide: FaqRepository, useClass: FaqMongoRepository },
  { provide: TestimonialRepository, useClass: TestimonialMongoRepository },
  { provide: QueryInfoRepository, useClass: QueryInfoMongoRepository },
  { provide: CityZipCodeRepository, useClass: CityZipCodeMongoRepository },
  { provide: NfeRepository, useClass: NfeMongoRepository },
  { provide: CarRevendorRepository, useClass: CarRevendorMongoRepository },
  { provide: PaymentManagementRepository, useClass: PaymentManagementMongoRepository },
  { provide: OwnerReviewModelRepository, useClass: OwnerReviewModelRedisRepository },
  { provide: MyCarProductRepository, useClass: MyCarProductMongoRepository },
  { provide: PlanRepository, useClass: PlanMongoRepository },
  { provide: CreditQueryRepository, useClass: CreditQueryRedisRepository },
  { provide: SubscriptionRepository, useClass: SubscriptionMongoRepository },
  { provide: VersionAppControlRepository, useClass: VersionAppControlMongoRepository },
  { provide: TotalTestDriveRepository, useClass: TotalTestDriveMongoRepository },
  { provide: SpanLogRepository, useClass: SpanLogMongoRepository },
  { provide: AnalyticsRepository, useClass: AnalyticsMongoRepository },
];

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [EnvService],
      useFactory: async (envService: EnvService) => ({
        uri: envService.get(ENV_KEYS.DATABASE_CONNECTION_STRING),
      }),
    }),
    MongooseModule.forFeature([...modelDefinitions]),
    RedisManagerModule,
  ],
  controllers: [],
  providers: [...repositoryProviders],
  exports: [...repositoryProviders],
})
export class RepositoryModule {}
