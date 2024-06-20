import { HttpModule } from '@nestjs/axios';
import { Global, Module, Provider, Type } from '@nestjs/common';
import axios from 'axios';

import { CaptchaMultiServices, MultiServices } from 'src/domain/_layer/infrastructure/multi-service';
import { EVENT_EMITTER_SERVICE } from 'src/domain/_layer/infrastructure/service/event/event.service';
import { MarkintingService } from 'src/domain/_layer/infrastructure/service/marketing.service';
import { NfeService } from 'src/domain/_layer/infrastructure/service/nfe.service';
import { NotificationServiceGen } from 'src/domain/_layer/infrastructure/service/notification';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { PaymentService } from 'src/domain/_layer/infrastructure/service/payment.service';
import { QueryLegacyService } from 'src/domain/_layer/infrastructure/service/query-legacy.service';
import { QueryParserService } from 'src/domain/_layer/infrastructure/service/query-parser.service';
import { QueryPostalCodeService } from 'src/domain/_layer/infrastructure/service/query-postal-code.service';
import { QueryProviderService } from 'src/domain/_layer/infrastructure/service/query-provider.service';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { ConsentsService } from 'src/domain/_layer/infrastructure/service/user-consents.service';
import { TetrisService } from 'src/infrastructure/service/query/tetris.service';
import { IndicateAndEarnService } from '../../domain/_layer/infrastructure/service/indicate-and-earn.service';
import { LocationService } from '../../domain/_layer/infrastructure/service/location.service';
import { TagManagerService } from '../../domain/_layer/infrastructure/service/tag-manager.service';
import { UserUtilizationLogService } from '../../domain/_layer/infrastructure/service/user-utilization-log.service';
import { ENV_KEYS, EnvService } from '../framework/env.service';
import { ArcApiService } from './arc-api.service';
import { CarOwnerReviewService } from './car-owner-review.service';
import { EmailMarkintingService } from './email/marketing.service';
import { ENotasService } from './enotas.service';
import { GoogleTagManagerService } from './google-tag-manager.service';
import { IBGEService } from './ibge.service';
import { IndicateApiService } from './indicate-api.service';
import { LegacyOncApiService } from './legacy-onc-api.service';
import { NestEventEmitterService } from './nest-event.service';
import { NotificationService } from './notification.service';
import { QueryMolecularService } from './query-molecular.service';
import { QueryRosettaService } from './query-rosetta.service';
import { UserConsentsService } from './user-consents.service';
import { UtilizationLogMicroService } from './utilization-log-micro.service';
import { ViaCepService } from './viacep.service';

import { UtilizationLogsTracker } from '@diegomoura637/utilization-log-producer';
import { AutoReprocessQueryService } from 'src/domain/_layer/infrastructure/service/auto-reprocess.service';
import { AutomateService } from 'src/domain/_layer/infrastructure/service/automate.service';
import { BlogService } from 'src/domain/_layer/infrastructure/service/blog.service';
import { FeatureFlagPerRequestService } from 'src/domain/_layer/infrastructure/service/feature-flag-per-request.service';
import { LegacySubscriptionGatewayService } from 'src/domain/_layer/infrastructure/service/legacy-subscription-gateway.service';
import { PublicSiteStorage } from 'src/domain/_layer/infrastructure/service/public-site-storage.service';
import { StaticDataService } from 'src/domain/_layer/infrastructure/service/static-data.service';
import { VehicleImageService } from 'src/domain/_layer/infrastructure/service/vehicle-image.service';
import { VehicleVersionService } from 'src/domain/_layer/infrastructure/service/vehicle-version.service';
import { VideoPlatformService } from 'src/domain/_layer/infrastructure/service/video-platform.service';
import { WebhookService } from 'src/domain/_layer/infrastructure/service/webhook.service';
import { MessagingModule } from 'src/infrastructure/messaging/messaging.module';
import { QueryResponseParser } from 'src/infrastructure/service/query/query-response.parser';
import { TestDriveResponseParser } from 'src/infrastructure/service/query/test-drive-response.parser';
import { CaptchaKind } from '../../domain/_layer/infrastructure/captcha/captcha.guard';
import { CaptchaService } from '../../domain/_layer/infrastructure/service/captcha.service';
import { FeatureFlagService } from '../../domain/_layer/infrastructure/service/feature-flag.service';
import { LoggingAxiosInterceptor } from '../interceptor/logging-axios.interceptor';
import { CacheHttpService } from './cache-http.service';
import { GoogleRecaptchaV2Service } from './captcha/google-recaptcha-v2.service';
import { CorvetteService } from './corvette.service';
import { FipeApiService } from './fipe-api.service';
import { GrowthBookPerRequestService } from './growth-book-per-request.service';
import { GrowthBookService } from './growth-book.service';
import { IuguService } from './iugu.service';
import { MustangQueryService } from './mustang-query.service';
import { N8NService } from './n8n.service';
import { OncBlogService } from './onc-blog.service';
import { SiteBucketService } from './sitemap-bucket.service';
import { StaticVehicleImageService } from './static-vehicle-image.service';
import { WebhookResponseService } from './webhook-response.service';
import { YoutubeService } from './youtube.service';

const captchaServices: Record<CaptchaKind, Type<CaptchaService<unknown>>> = {
  [CaptchaKind.GOOGLE_RECAPTCHA_V2]: GoogleRecaptchaV2Service,
};

const multiCaptchaFactory = (...services: ReadonlyArray<CaptchaService<unknown>>): CaptchaMultiServices => {
  return Object.keys(captchaServices).reduce((acc: Partial<CaptchaMultiServices>, key: CaptchaKind, index: number) => {
    return { ...acc, [key]: services[index] };
  }, {}) as CaptchaMultiServices;
};

const services: ReadonlyArray<Provider> = [
  {
    provide: CacheHttpService,
    useFactory: (): CacheHttpService => new CacheHttpService(axios.create()),
  },
  { provide: EVENT_EMITTER_SERVICE, useClass: NestEventEmitterService },
  { provide: MarkintingService, useClass: EmailMarkintingService },
  { provide: QueryProviderService, useClass: QueryMolecularService },
  { provide: QueryParserService, useClass: QueryRosettaService },
  { provide: QueryLegacyService, useClass: LegacyOncApiService },
  { provide: ConsentsService, useClass: UserConsentsService },
  { provide: NotificationServiceGen, useClass: NotificationService },
  { provide: OwnerReviewService, useClass: CarOwnerReviewService },
  { provide: PaymentService, useClass: LegacyOncApiService },
  { provide: LocationService, useClass: IBGEService },
  { provide: UserUtilizationLogService, useClass: UtilizationLogMicroService },
  { provide: PaymentGatewayService, useClass: ArcApiService },
  { provide: NfeService, useClass: ENotasService },
  { provide: IndicateAndEarnService, useClass: IndicateApiService },
  { provide: TagManagerService, useClass: GoogleTagManagerService },
  { provide: QueryRequestService, useClass: TetrisService },
  { provide: FeatureFlagService, useClass: GrowthBookService },
  { provide: BlogService, useClass: OncBlogService },
  { provide: VideoPlatformService, useClass: YoutubeService },
  { provide: VehicleImageService, useClass: StaticVehicleImageService },
  { provide: AutoReprocessQueryService, useClass: CorvetteService },
  { provide: FeatureFlagPerRequestService, useClass: GrowthBookPerRequestService },
  { provide: VehicleVersionService, useClass: FipeApiService },
  { provide: PublicSiteStorage, useClass: SiteBucketService },
  { provide: WebhookService, useClass: WebhookResponseService },
  { provide: StaticDataService, useClass: MustangQueryService },
  { provide: AutomateService, useClass: N8NService },
  { provide: LegacySubscriptionGatewayService, useClass: IuguService },
  {
    provide: MultiServices.CAPTCHA,
    useFactory: multiCaptchaFactory,
    inject: Object.values(captchaServices),
  },
  ...Object.values(captchaServices),
  {
    provide: MultiServices.CAPTCHA,
    useFactory: multiCaptchaFactory,
    inject: Object.values(captchaServices),
  },
  ...Object.values(captchaServices),
  { provide: QueryPostalCodeService, useClass: ViaCepService },
  LoggingAxiosInterceptor,
];

const parsers: ReadonlyArray<Provider> = [TestDriveResponseParser, QueryResponseParser];

@Module({
  providers: [
    {
      provide: UtilizationLogsTracker,
      useFactory: (envService: EnvService): UtilizationLogsTracker =>
        new UtilizationLogsTracker(envService.get('APPLICATION_ID'), null),
      inject: [EnvService],
    },
  ],
  exports: [UtilizationLogsTracker],
})
class ServiceDepsModule {}

@Global()
@Module({
  imports: [
    ServiceDepsModule,
    MessagingModule,
    HttpModule.registerAsync({
      inject: [EnvService],
      useFactory: async (envService: EnvService) => ({
        timeout: envService.get(ENV_KEYS.HTTP_TIMEOUT),
      }),
    }),
  ],
  providers: [...services, ...parsers],
  exports: [...services],
})
export class ServiceModule {}
