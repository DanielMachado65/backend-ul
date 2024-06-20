import { Global, Module, Provider } from '@nestjs/common';
import { MultiServices } from 'src/domain/_layer/infrastructure/multi-service';
import { AutoReprocessQueryService } from 'src/domain/_layer/infrastructure/service/auto-reprocess.service';
import { AutomateService } from 'src/domain/_layer/infrastructure/service/automate.service';
import { BlogService } from 'src/domain/_layer/infrastructure/service/blog.service';
import { EVENT_EMITTER_SERVICE } from 'src/domain/_layer/infrastructure/service/event/event.service';
import { FeatureFlagPerRequestService } from 'src/domain/_layer/infrastructure/service/feature-flag-per-request.service';
import { LegacySubscriptionGatewayService } from 'src/domain/_layer/infrastructure/service/legacy-subscription-gateway.service';
import { MarkintingService } from 'src/domain/_layer/infrastructure/service/marketing.service';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { PaymentService } from 'src/domain/_layer/infrastructure/service/payment.service';
import { PublicSiteStorage } from 'src/domain/_layer/infrastructure/service/public-site-storage.service';
import { QueryPostalCodeService } from 'src/domain/_layer/infrastructure/service/query-postal-code.service';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { StaticDataService } from 'src/domain/_layer/infrastructure/service/static-data.service';
import { VehicleImageService } from 'src/domain/_layer/infrastructure/service/vehicle-image.service';
import { VehicleVersionService } from 'src/domain/_layer/infrastructure/service/vehicle-version.service';
import { VideoPlatformService } from 'src/domain/_layer/infrastructure/service/video-platform.service';
import { WebhookService } from 'src/domain/_layer/infrastructure/service/webhook.service';
import { TetrisMockService } from 'src/infrastructure/service/mock/tetris.mock.service';
import { CaptchaKind } from '../../../domain/_layer/infrastructure/captcha/captcha.guard';
import { FeatureFlagService } from '../../../domain/_layer/infrastructure/service/feature-flag.service';
import { IndicateAndEarnService } from '../../../domain/_layer/infrastructure/service/indicate-and-earn.service';
import { NfeService } from '../../../domain/_layer/infrastructure/service/nfe.service';
import { NotificationServiceGen } from '../../../domain/_layer/infrastructure/service/notification';
import { QueryLegacyService } from '../../../domain/_layer/infrastructure/service/query-legacy.service';
import { QueryParserService } from '../../../domain/_layer/infrastructure/service/query-parser.service';
import { QueryProviderService } from '../../../domain/_layer/infrastructure/service/query-provider.service';
import { TagManagerService } from '../../../domain/_layer/infrastructure/service/tag-manager.service';
import { ConsentsService } from '../../../domain/_layer/infrastructure/service/user-consents.service';
import { UserUtilizationLogService } from '../../../domain/_layer/infrastructure/service/user-utilization-log.service';
import { ArcApiMockService } from './arc-api.mock.service';
import { AutoReprocessQueryServiceMock } from './auto-reprocess.mock.service';
import { BlogMockService } from './blog.mock.service';
import { GoogleRecaptchaV2MockService } from './captcha/google-recaptcha-v2.mock.service';
import { EmailMarkintingMockService } from './email/marketing.mock.service';
import { ENotasMockService } from './enotas.mock.service';
import { GoogleTagManagerMockService } from './google-tag-manager.mock.service';
import { GrowthBookPerRequestMockService } from './growth-book-per-request.mock.service';
import { GrowthBookMockService } from './growth-book.mock.service';
import { IndicateApiMockService } from './indicate-api.mock.service';
import { LegacyOncApiMockService } from './legacy-onc-api.mock.service';
import { NotificationMockService } from './notification.mock.service';
import { CarOwnerReviewMockService } from './owner-review.mock.service';
import { QueryMolecularMockService } from './query-molecular.mock.service';
import { QueryRosettaMockService } from './query-rosetta.mock.service';
import { SiteBucketMockService } from './sitemap-bucket.mock.service';
import { UserConsentsMockService } from './user-consents.mock.service';
import { UserUtilizationLogMockService } from './utilization-log.mock.service';
import { VehicleImageMockService } from './vehicle-image.service';
import { VehicleVersionMockService } from './vehicle-version.mock.service';
import { ViaCepMockService } from './viacep.mock.service';
import { VideoPlatformMockService } from './video-platform.mock.service';

const services: readonly Provider[] = [
  { provide: EVENT_EMITTER_SERVICE, useValue: {} },
  { provide: QueryLegacyService, useClass: LegacyOncApiMockService },
  { provide: QueryProviderService, useClass: QueryMolecularMockService },
  { provide: QueryParserService, useClass: QueryRosettaMockService },
  { provide: ConsentsService, useClass: UserConsentsMockService },
  { provide: NotificationServiceGen, useClass: NotificationMockService },
  { provide: PaymentGatewayService, useClass: ArcApiMockService },
  { provide: NfeService, useClass: ENotasMockService },
  { provide: MarkintingService, useClass: EmailMarkintingMockService },
  { provide: PaymentService, useClass: Function },
  { provide: IndicateAndEarnService, useClass: IndicateApiMockService },
  { provide: TagManagerService, useClass: GoogleTagManagerMockService },
  { provide: UserUtilizationLogService, useClass: UserUtilizationLogMockService },
  { provide: QueryRequestService, useClass: TetrisMockService },
  { provide: FeatureFlagService, useClass: GrowthBookMockService },
  { provide: BlogService, useClass: BlogMockService },
  { provide: VideoPlatformService, useClass: VideoPlatformMockService },
  { provide: OwnerReviewService, useClass: CarOwnerReviewMockService },
  { provide: VehicleImageService, useClass: VehicleImageMockService },
  { provide: AutoReprocessQueryService, useValue: AutoReprocessQueryServiceMock },
  { provide: FeatureFlagPerRequestService, useValue: GrowthBookPerRequestMockService },
  { provide: VehicleVersionService, useValue: VehicleVersionMockService },
  { provide: PublicSiteStorage, useClass: SiteBucketMockService },
  { provide: WebhookService, useValue: { sendMany: jest.fn() } },
  { provide: StaticDataService, useValue: { getPreQuery: jest.fn() } },
  { provide: AutomateService, useValue: { dispatch: jest.fn() } },
  { provide: LegacySubscriptionGatewayService, useValue: { dispatch: jest.fn() } },
  {
    provide: MultiServices.CAPTCHA,
    useValue: {
      [CaptchaKind.GOOGLE_RECAPTCHA_V2]: GoogleRecaptchaV2MockService,
    },
  },
  {
    provide: MultiServices.CAPTCHA,
    useValue: {
      [CaptchaKind.GOOGLE_RECAPTCHA_V2]: GoogleRecaptchaV2MockService,
    },
  },
  { provide: QueryPostalCodeService, useClass: ViaCepMockService },
];

@Global()
@Module({
  providers: [...services],
  exports: [...services],
})
export class ServiceMockModule {}
