import { Global, Module } from '@nestjs/common';

import { AuthPresentationLayerModule } from 'src/presentation/support/auth/auth-presentation-layer.module';
import { JobsPresentationModule } from 'src/presentation/support/jobs/jobs.presentation.module';
import { PriceTablePresentationLayerModule } from 'src/presentation/support/price-table/price-table-presentation-layer.module';
import { ProductPresentationLayerModule } from './core/product/product-presentation-layer.module';
import { QueryPresentationLayerModule } from './core/query/query-presentation-layer.module';
import { UserPresentationLayerModule } from './core/user/user-presentation-layer.module';
import { LegacyDocsPresentationLayerModule } from './random/legacy-docs/legacy-docs-presentation-layer.module';
import { AppControlModule } from './support/app-control/app-control-layer.module';
import { BillingPresentationLayerModule } from './support/billing/billing-presentation-layer.module';
import { CompanyPresentationLayerModule } from './support/company/company.module';
import { CouponPresentationLayerModule } from './support/coupon/coupon-presentation-layer.module';
import { EmailPresentationLayerModule } from './support/email/email-presentation-layer.module';
import { FeedbackPresentationLayerModule } from './support/feedback/feedback.module';
import { GeneralPresentationLayerModule } from './support/general/general.module';
import { HealthCheckPresentationLayerModule } from './support/health-check/health-check-presentation-layer.module';
import { ListenerPresentationLayerModule } from './support/listener/listener-presentation-layer.module';
import { MarketingPresentationLayerModule } from './support/marketing/marketing-presentation-layer.module';
import { NotificationPresentationLayerModule } from './support/notification/notification-presentation-layer.module';
import { OwnerReviewPresentationLayerModule } from './support/owner-review/owner-review-presentation-layer.module';
import { PartnerPresentationLayerModule } from './support/partner/partner-presentation-layer.module';
import { PaymentPresentationLayerModule } from './support/payment/payment-presentation-layer.module';
import { WebhookPresentationLayerModule } from './support/webhook/webhook-presentation-layer.module';
import { TrackingPresentationLayerModule } from './support/tracking/tracking.module';
import { RewardsPresentationLayerModule } from './support/rewards/rewards-presentation-layer.module';

@Global()
@Module({
  imports: [
    HealthCheckPresentationLayerModule,
    BillingPresentationLayerModule,
    QueryPresentationLayerModule,
    UserPresentationLayerModule,
    AuthPresentationLayerModule,
    LegacyDocsPresentationLayerModule,
    FeedbackPresentationLayerModule,
    MarketingPresentationLayerModule,
    NotificationPresentationLayerModule,
    OwnerReviewPresentationLayerModule,
    ProductPresentationLayerModule,
    PartnerPresentationLayerModule,
    PaymentPresentationLayerModule,
    TrackingPresentationLayerModule,
    CompanyPresentationLayerModule,
    CouponPresentationLayerModule,
    GeneralPresentationLayerModule,
    WebhookPresentationLayerModule,
    EmailPresentationLayerModule,
    ListenerPresentationLayerModule,
    JobsPresentationModule,
    PriceTablePresentationLayerModule,
    AppControlModule,
    RewardsPresentationLayerModule,
  ],
  controllers: [],
  providers: [],
})
export class PresentationLayerModule {}
