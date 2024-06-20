import { Global, Module, Provider } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { BalanceRepository } from 'src/domain/_layer/infrastructure/repository/balance.repository';
import { BillingRepository } from 'src/domain/_layer/infrastructure/repository/billing.repository';
import { CarRevendorRepository } from 'src/domain/_layer/infrastructure/repository/car-revendor.repository';
import { CityZipCodeRepository } from 'src/domain/_layer/infrastructure/repository/city-zipcode.repository';
import { ConsumptionStatementRepository } from 'src/domain/_layer/infrastructure/repository/consumption-statement.repository';
import { CouponRepository } from 'src/domain/_layer/infrastructure/repository/coupon.repository';
import { CreditQueryRepository } from 'src/domain/_layer/infrastructure/repository/credit-query.repository';
import { FeedbackQueryRepository } from 'src/domain/_layer/infrastructure/repository/feedback-query.repository';
import { HttpLogRepository } from 'src/domain/_layer/infrastructure/repository/http-log.repository';
import { InvoiceRepository } from 'src/domain/_layer/infrastructure/repository/invoice.repository';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { OwnerReviewModelRepository } from 'src/domain/_layer/infrastructure/repository/owner-review-model.repository';
import { PackageRepository } from 'src/domain/_layer/infrastructure/repository/package.repository';
import { PaymentManagementRepository } from 'src/domain/_layer/infrastructure/repository/payment-managament.repository';
import { PaymentRepository } from 'src/domain/_layer/infrastructure/repository/payment.repository';
import { PlanRepository } from 'src/domain/_layer/infrastructure/repository/plan.repository';
import { PriceTableRepository } from 'src/domain/_layer/infrastructure/repository/price-table.repository';
import { QueryComposerRepository } from 'src/domain/_layer/infrastructure/repository/query-composer.repository';
import { QueryLogRepository } from 'src/domain/_layer/infrastructure/repository/query-log.repository';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { ServiceLogRepository } from 'src/domain/_layer/infrastructure/repository/service-log.repository';
import { ServiceRepository } from 'src/domain/_layer/infrastructure/repository/service.repository';
import { SpanLogRepository } from 'src/domain/_layer/infrastructure/repository/span-log.repository';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { TestDriveQueryRepository } from 'src/domain/_layer/infrastructure/repository/test-drive-query.repository';
import { TotalTestDriveRepository } from 'src/domain/_layer/infrastructure/repository/total-test-drive.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { EVENT_EMITTER_SERVICE } from 'src/domain/_layer/infrastructure/service/event/event.service';
import { getCurrentTestMongoUri } from 'src/get-test-uri';
import { mCityZipCodesModelDef } from 'src/infrastructure/model/city-zipcode.model';
import { CreditQueryMemoryRepository } from 'src/infrastructure/repository/query/credit-query.memory.repository';
import { CityZipCodeMongoRepository } from 'src/infrastructure/repository/zipcode/city-zipcode.mongo.repository';
import { NfeRepository } from '../../domain/_layer/infrastructure/repository/nfe.repository';
import { PartnerIncomingRepository } from '../../domain/_layer/infrastructure/repository/partner-incoming.repository';
import { envMockProvider } from '../framework/env.mock.service';
import { mBalanceModelDef } from '../model/balance.model';
import { mBillingModelDef } from '../model/billing.model';
import { mCarRevendorModelDef } from '../model/car-revendor.model';
import { mConsumptionStatementModelDef } from '../model/consumption-statement.model';
import { mCouponModelDef } from '../model/coupon.model';
import { mFaqModelDef } from '../model/faq.model';
import { mFeedbackModelDef } from '../model/feedback.model';
import { mHttpLogModelDef } from '../model/http-log.model';
import { mInvoiceModelDef } from '../model/invoice.model';
import { mLogModelDef } from '../model/log.model';
import { mMyCarProductModelDef } from '../model/my-car-product.model';
import { mNfeModelDef } from '../model/nfe.model';
import { mPackageModelDef } from '../model/package.model';
import { mPartnerIncomingModelDef } from '../model/partner-incoming.model';
import { mPartnerModelDef } from '../model/partner.model';
import { mPaymentsManagementModelDef } from '../model/payment-management.model';
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
import { mSpanLogModelDef } from '../model/span-log.model';
import { mSubscriptionModelDef } from '../model/subscription.model';
import { mTermModelDef } from '../model/term.model';
import { mTestDriveQueryModelDef } from '../model/test-drive-query.model';
import { mTestimonialModelDef } from '../model/testimonial.model';
import { mTotalTestDriveModelDef } from '../model/total-test-drive.model';
import { mUserModelDef } from '../model/user.model';
import { FakeEventEmitterService } from '../service/mock/fake-event-emitter.service';
import { ArcUtil } from '../util/arc.util';
import { ArrayUtil } from '../util/array.util';
import { AuthUtil } from '../util/auth.util';
import { ClassValidatorUtil } from '../util/class-validator.util';
import { CpfUtil } from '../util/cpf.util';
import { CreditCardUtil } from '../util/credit-card.util';
import { CurrencyUtil } from '../util/currency.util';
import { DateTimeUtil } from '../util/date-time-util.service';
import { EncryptionUtil } from '../util/encryption.util';
import { FipeCodeObfuscatorUtil } from '../util/fipe-code-obfuscator.util';
import { BrazilianGreetingUtil, GreetingUtil } from '../util/greeting.util';
import { JwtUtil } from '../util/jwt.util';
import { ObjectUtil } from '../util/object.util';
import { PromiseUtil } from '../util/promise.util';
import { RevisionPlanUtils } from '../util/revision-plan.util';
import { SheetUtil } from '../util/sheet.util';
import { TransitionUtil } from '../util/transition.util';
import { UserAgentUtil } from '../util/user-agent.util';
import { RedisManagerMockModule } from './_redis/redis-manager.mock.module';
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
import { FeedbackQueryMongoRepository } from './feedback/feedback.mongo.repository';
import { HttpLogMongoRepository } from './infra/http-log.mongo.repository';
import { SpanLogMongoRepository } from './infra/span-log.mongo.repository';
import { OwnerReviewModelRedisRepository } from './owner-review/owner-review-model.redis.repository';
import { PartnerIncomingMongoRepository } from './partner/partner-incoming.mongo.repository';
import { PackageMongoRepository } from './product/package.mongo.repository';
import { QueryComposerMongoRepository } from './query/query-composer.mongo.repository';
import { QueryLogMongoRepository } from './query/query-log.mongo.repository';
import { QueryMongoRepository } from './query/query.mongo.repository';
import { ServiceLogMongoRepository } from './query/service-log.mongo.repository';
import { ServiceMongoRepository } from './query/service.mongo.repository';
import { TestDriveQueryMongoRepository } from './query/test-drive-query.mongo.repository';
import { TransactionHelper } from './transaction.helper';
import { TransactionMockHelper } from './transaction.mock.helper';
import { TransactionMongoHelper } from './transaction.mongo.helper';
import { CarRevendorMongoRepository } from './user/car-revendor.mongo.repository';
import { UserMongoRepository } from './user/user.mongo.repository';
import { AnalyticsRepository } from 'src/domain/_layer/infrastructure/repository/analytics.repository';
import { AnalyticsMongoRepository } from './user/analytics.mongo.repository';
import { mAnalyticsModelDef } from '../model/analytics.model';

const utils: ReadonlyArray<Provider> = [
  envMockProvider,
  { provide: GreetingUtil, useClass: BrazilianGreetingUtil },
  CurrencyUtil,
  DateTimeUtil,
  EncryptionUtil,
  JwtUtil,
  ArrayUtil,
  AuthUtil,
  CpfUtil,
  UserAgentUtil,
  CreditCardUtil,
  ClassValidatorUtil,
  PromiseUtil,
  SheetUtil,
  TransitionUtil,
  ObjectUtil,
  FipeCodeObfuscatorUtil,
  RevisionPlanUtils,
  ArcUtil,
];

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
  mNfeModelDef,
  mPartnerIncomingModelDef,
  mCityZipCodesModelDef,
  mCarRevendorModelDef,
  mPaymentsManagementModelDef,
  mMyCarProductModelDef,
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
  { provide: NfeRepository, useClass: NfeMongoRepository },
  { provide: PartnerIncomingRepository, useClass: PartnerIncomingMongoRepository },
  { provide: CityZipCodeRepository, useClass: CityZipCodeMongoRepository },
  { provide: EVENT_EMITTER_SERVICE, useClass: FakeEventEmitterService },
  { provide: CarRevendorRepository, useClass: CarRevendorMongoRepository },
  { provide: PaymentManagementRepository, useClass: PaymentManagementMongoRepository },
  { provide: OwnerReviewModelRepository, useValue: OwnerReviewModelRedisRepository },
  { provide: MyCarProductRepository, useValue: {} },
  { provide: PlanRepository, useValue: PlanMongoRepository },
  { provide: CreditQueryRepository, useValue: CreditQueryMemoryRepository },
  { provide: SubscriptionRepository, useValue: SubscriptionMongoRepository },
  { provide: TotalTestDriveRepository, useValue: {} },
  { provide: SpanLogRepository, useClass: SpanLogMongoRepository },
  { provide: AnalyticsRepository, useClass: AnalyticsMongoRepository },
];

const additionalProviders: ReadonlyArray<Provider> = [{ provide: TransactionHelper, useClass: TransactionMockHelper }];

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(getCurrentTestMongoUri()),
    MongooseModule.forFeature([...modelDefinitions]),
    RedisManagerMockModule,
  ],
  controllers: [],
  providers: [...repositoryProviders, ...additionalProviders, ...utils],
  exports: [...repositoryProviders, ...additionalProviders, ...utils],
})
export class RepositoryMockModule {}
