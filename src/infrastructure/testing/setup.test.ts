/* eslint-disable functional/immutable-data */
import { Abstract, Type } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import * as mongoose from 'mongoose';
import { ClsModule } from 'nestjs-cls';
import { ProductDataLayerModule } from 'src/data/core/product/product-data-layer.module';
import { QueryDataLayerModule } from 'src/data/core/query/query-data-layer.module';
import { UserDataLayerModule } from 'src/data/core/user/user-data-layer.module';
import { AuthDataLayerModule } from 'src/data/support/auth/auth-data-layer.module';
import { BillingDataLayerModule } from 'src/data/support/billing/billing-data-layer.module';
import { LoggingDataLayerModule } from 'src/data/support/logging/logging.module';
import { MarketingDataLayerModule } from 'src/data/support/marketing/marketing-data-layer.module';
import { OwnerReviewDataLayerModule } from 'src/data/support/owner-review/owner-review-data-layer.module';
import { PaymentDataLayerModule } from 'src/data/support/payment/payment-data-layer.module';
import { SupportDataLayerModule } from 'src/data/support/support/support.module';
import { CaptchaMultiServices, MultiServices } from 'src/domain/_layer/infrastructure/multi-service';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { BalanceRepository } from 'src/domain/_layer/infrastructure/repository/balance.repository';
import { BillingRepository } from 'src/domain/_layer/infrastructure/repository/billing.repository';
import { CarRevendorRepository } from 'src/domain/_layer/infrastructure/repository/car-revendor.repository';
import { CityZipCodeRepository } from 'src/domain/_layer/infrastructure/repository/city-zipcode.repository';
import { ConsumptionStatementRepository } from 'src/domain/_layer/infrastructure/repository/consumption-statement.repository';
import { CouponRepository } from 'src/domain/_layer/infrastructure/repository/coupon.repository';
import { FeedbackQueryRepository } from 'src/domain/_layer/infrastructure/repository/feedback-query.repository';
import { InvoiceRepository } from 'src/domain/_layer/infrastructure/repository/invoice.repository';
import { NfeRepository } from 'src/domain/_layer/infrastructure/repository/nfe.repository';
import { PackageRepository } from 'src/domain/_layer/infrastructure/repository/package.repository';
import { PaymentManagementRepository } from 'src/domain/_layer/infrastructure/repository/payment-managament.repository';
import { PaymentRepository } from 'src/domain/_layer/infrastructure/repository/payment.repository';
import { PriceTableRepository } from 'src/domain/_layer/infrastructure/repository/price-table.repository';
import { QueryComposerRepository } from 'src/domain/_layer/infrastructure/repository/query-composer.repository';
import { QueryLogRepository } from 'src/domain/_layer/infrastructure/repository/query-log.repository';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { ServiceLogRepository } from 'src/domain/_layer/infrastructure/repository/service-log.repository';
import { ServiceRepository } from 'src/domain/_layer/infrastructure/repository/service.repository';
import { TestDriveQueryRepository } from 'src/domain/_layer/infrastructure/repository/test-drive-query.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { AutoReprocessQueryService } from 'src/domain/_layer/infrastructure/service/auto-reprocess.service';
import { FeatureFlagPerRequestService } from 'src/domain/_layer/infrastructure/service/feature-flag-per-request.service';
import { MarkintingService } from 'src/domain/_layer/infrastructure/service/marketing.service';
import { NfeService } from 'src/domain/_layer/infrastructure/service/nfe.service';
import { NotificationServiceGen } from 'src/domain/_layer/infrastructure/service/notification';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { PublicSiteStorage } from 'src/domain/_layer/infrastructure/service/public-site-storage.service';
import { QueryLegacyService } from 'src/domain/_layer/infrastructure/service/query-legacy.service';
import { QueryParserService } from 'src/domain/_layer/infrastructure/service/query-parser.service';
import { QueryPostalCodeService } from 'src/domain/_layer/infrastructure/service/query-postal-code.service';
import { QueryProviderService } from 'src/domain/_layer/infrastructure/service/query-provider.service';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { ConsentsService } from 'src/domain/_layer/infrastructure/service/user-consents.service';
import { WebhookService } from 'src/domain/_layer/infrastructure/service/webhook.service';
import { JobMockModule } from 'src/infrastructure/job/test/job.mock.module';
import { NotificationMockModule } from 'src/infrastructure/notification/test/notification.mock.module';
import { PartnerDataLayerModule } from '../../data/support/partner/partner-data-layer.module';
import { PartnerIncomingRepository } from '../../domain/_layer/infrastructure/repository/partner-incoming.repository';
import { FeatureFlagService } from '../../domain/_layer/infrastructure/service/feature-flag.service';
import { IndicateAndEarnService } from '../../domain/_layer/infrastructure/service/indicate-and-earn.service';
import { TagManagerService } from '../../domain/_layer/infrastructure/service/tag-manager.service';
import { UserUtilizationLogService } from '../../domain/_layer/infrastructure/service/user-utilization-log.service';
import { EnvService } from '../framework/env.service';
import { RepositoryMockModule } from '../repository/repository.mock.module';
import { ServiceMockModule } from '../service/mock/service.mock.module';
import { rastruModule } from '../tracing/trace.definition';
import { ArrayUtil } from '../util/array.util';
import { AuthUtil } from '../util/auth.util';
import { ClassValidatorUtil } from '../util/class-validator.util';
import { CpfUtil } from '../util/cpf.util';
import { CreditCardUtil } from '../util/credit-card.util';
import { CurrencyUtil } from '../util/currency.util';
import { DateTimeUtil } from '../util/date-time-util.service';
import { EncryptionUtil } from '../util/encryption.util';
import { GreetingUtil } from '../util/greeting.util';
import { JwtUtil } from '../util/jwt.util';
import { ObjectUtil } from '../util/object.util';
import { PromiseUtil } from '../util/promise.util';
import { SheetUtil } from '../util/sheet.util';
import { TransitionUtil } from '../util/transition.util';
import { UserAgentUtil } from '../util/user-agent.util';
import { TestFactory } from './test.factory.test';

export interface ISetupRepository {
  readonly balance: BalanceRepository;
  readonly billing: BillingRepository;
  readonly consumptionStatement: ConsumptionStatementRepository;
  readonly coupon: CouponRepository;
  readonly feedbackQuery: FeedbackQueryRepository;
  readonly invoice: InvoiceRepository;
  readonly nfe: NfeRepository;
  readonly package: PackageRepository;
  readonly partnerIncoming: PartnerIncomingRepository;
  readonly payment: PaymentRepository;
  readonly paymentManagement: PaymentManagementRepository;
  readonly priceTable: PriceTableRepository;
  readonly query: QueryRepository;
  readonly queryComposer: QueryComposerRepository;
  readonly queryLog: QueryLogRepository;
  readonly service: ServiceRepository;
  readonly serviceLog: ServiceLogRepository;
  readonly testDriveQuery: TestDriveQueryRepository;
  readonly user: UserRepository;
  readonly carVendor: CarRevendorRepository;
  readonly cityZipCode: CityZipCodeRepository;
}

export interface ISetupService {
  readonly captchaServices: CaptchaMultiServices;
  readonly consentsService: ConsentsService;
  readonly indicateAndEarnService: IndicateAndEarnService;
  readonly markintingService: MarkintingService;
  readonly nfeService: NfeService;
  readonly notificationServiceGen: NotificationServiceGen;
  readonly paymentGatewayService: PaymentGatewayService;
  readonly queryLegacyService: QueryLegacyService;
  readonly queryParserService: QueryParserService;
  readonly queryPostalCodeService: QueryPostalCodeService;
  readonly queryProviderService: QueryProviderService;
  readonly tagManagerService: TagManagerService;
  readonly userUtilizationLogService: UserUtilizationLogService;
  readonly queryRequestService: QueryRequestService;
  readonly featureFlagService: FeatureFlagService;
  readonly ownerReviewService: OwnerReviewService;
  readonly autoReprocessQueryService: AutoReprocessQueryService;
  readonly featureFlagPerRequestService: FeatureFlagPerRequestService;
  readonly sitemapBucketService: PublicSiteStorage;
  readonly webhookService: WebhookService;
}

export interface ISetupUtil {
  readonly array: ArrayUtil;
  readonly auth: AuthUtil;
  readonly classValidator: ClassValidatorUtil;
  readonly cpf: CpfUtil;
  readonly creditCard: CreditCardUtil;
  readonly currency: CurrencyUtil;
  readonly dateTime: DateTimeUtil;
  readonly encryption: EncryptionUtil;
  readonly envSer: EnvService;
  readonly greeting: GreetingUtil;
  readonly jwt: JwtUtil;
  readonly object: ObjectUtil;
  readonly promise: PromiseUtil;
  readonly sheet: SheetUtil;
  readonly transition: TransitionUtil;
  readonly userAgent: UserAgentUtil;
}

export interface ISetupNotification {
  readonly notificationInfra: NotificationInfrastructure;
}

export interface ISetupTestResult<UseCase> {
  readonly module: TestingModule;
  readonly repositories: ISetupRepository;
  readonly servicesMocks: ISetupService;
  readonly factory: TestFactory;
  readonly useCase: UseCase;
}

export class TestSetup<UseCase> implements ISetupTestResult<UseCase> {
  public module: TestingModule;
  public repositories: ISetupRepository;
  public servicesMocks: ISetupService;
  public utils: ISetupUtil;
  public factory: TestFactory;
  public useCase: UseCase;
  public notification: ISetupNotification;

  private constructor() {
    /** */
  }

  public static run<UseCase>(useCaseProvide: Type<UseCase> | Abstract<UseCase>): TestSetup<UseCase> {
    const setup: TestSetup<UseCase> = new TestSetup();

    beforeEach(async () => {
      setup.module = await Test.createTestingModule({
        imports: [
          UserDataLayerModule,
          BillingDataLayerModule,
          AuthDataLayerModule,
          MarketingDataLayerModule,
          ProductDataLayerModule,
          QueryDataLayerModule,
          PartnerDataLayerModule,
          PaymentDataLayerModule,
          OwnerReviewDataLayerModule,
          RepositoryMockModule,
          ServiceMockModule,
          NotificationMockModule,
          JobMockModule,
          SupportDataLayerModule,
          LoggingDataLayerModule,
          ServiceMockModule,
          ScheduleModule.forRoot(),
          ClsModule.forRootAsync({
            global: true,
            useFactory: () => ({
              middleware: {
                mount: false,
                generateId: true,
                idGenerator: (req: Request): string => {
                  let requestId: string = req.headers['x-request-id'] as string;

                  if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
                    requestId = new mongoose.Types.ObjectId().toString();
                    req.headers['x-request-id'] = requestId;
                  }

                  return requestId;
                },
              },
            }),
          }),
          rastruModule,
        ],
        providers: [],
      }).compile();

      setup.repositories = TestSetup.getRepositories(setup.module);
      setup.servicesMocks = TestSetup.getServices(setup.module);
      setup.utils = TestSetup.getUtils(setup.module);
      setup.factory = new TestFactory(setup.repositories);
      setup.useCase = setup.module.get(useCaseProvide);
      setup.notification = TestSetup.getNotification(setup.module);
    });

    afterEach(async () => {
      setup.module.close().finally();
    });

    return setup;
  }

  public static getRepositories(module: TestingModule): ISetupRepository {
    return {
      balance: module.get(BalanceRepository),
      billing: module.get(BillingRepository),
      consumptionStatement: module.get(ConsumptionStatementRepository),
      coupon: module.get(CouponRepository),
      feedbackQuery: module.get(FeedbackQueryRepository),
      invoice: module.get(InvoiceRepository),
      nfe: module.get(NfeRepository),
      package: module.get(PackageRepository),
      partnerIncoming: module.get(PartnerIncomingRepository),
      payment: module.get(PaymentRepository),
      paymentManagement: module.get(PaymentManagementRepository),
      priceTable: module.get(PriceTableRepository),
      query: module.get(QueryRepository),
      queryComposer: module.get(QueryComposerRepository),
      queryLog: module.get(QueryLogRepository),
      service: module.get(ServiceRepository),
      serviceLog: module.get(ServiceLogRepository),
      testDriveQuery: module.get(TestDriveQueryRepository),
      user: module.get(UserRepository),
      carVendor: module.get(CarRevendorRepository),
      cityZipCode: module.get(CityZipCodeRepository),
    };
  }

  public static getServices(module: TestingModule): ISetupService {
    return {
      captchaServices: module.get(MultiServices.CAPTCHA),
      consentsService: module.get(ConsentsService),
      indicateAndEarnService: module.get(IndicateAndEarnService),
      markintingService: module.get(MarkintingService),
      nfeService: module.get(NfeService),
      notificationServiceGen: module.get(NotificationServiceGen),
      paymentGatewayService: module.get(PaymentGatewayService),
      queryLegacyService: module.get(QueryLegacyService),
      queryParserService: module.get(QueryParserService),
      queryPostalCodeService: module.get(QueryPostalCodeService),
      queryProviderService: module.get(QueryProviderService),
      tagManagerService: module.get(TagManagerService),
      userUtilizationLogService: module.get(UserUtilizationLogService),
      queryRequestService: module.get(QueryRequestService),
      featureFlagService: module.get(FeatureFlagService),
      ownerReviewService: module.get(OwnerReviewService),
      autoReprocessQueryService: module.get(AutoReprocessQueryService),
      featureFlagPerRequestService: module.get(FeatureFlagPerRequestService),
      sitemapBucketService: module.get(PublicSiteStorage),
      webhookService: module.get(WebhookService),
    };
  }

  public static getUtils(module: TestingModule): ISetupUtil {
    return {
      array: module.get(ArrayUtil),
      auth: module.get(AuthUtil),
      classValidator: module.get(ClassValidatorUtil),
      cpf: module.get(CpfUtil),
      creditCard: module.get(CreditCardUtil),
      currency: module.get(CurrencyUtil),
      dateTime: module.get(DateTimeUtil),
      encryption: module.get(EncryptionUtil),
      envSer: module.get(EnvService),
      greeting: module.get(GreetingUtil),
      jwt: module.get(JwtUtil),
      object: module.get(ObjectUtil),
      promise: module.get(PromiseUtil),
      sheet: module.get(SheetUtil),
      transition: module.get(TransitionUtil),
      userAgent: module.get(UserAgentUtil),
    };
  }

  public static getNotification(module: TestingModule): ISetupNotification {
    return {
      notificationInfra: module.get(NotificationInfrastructure),
    };
  }
}
