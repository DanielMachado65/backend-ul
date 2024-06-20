import { Module } from '@nestjs/common';

import { ProductDataLayerModule } from 'src/data/core/product/product-data-layer.module';
import { QueryDataLayerModule } from 'src/data/core/query/query-data-layer.module';
import { UserDataLayerModule } from 'src/data/core/user/user-data-layer.module';
import { BillingDataLayerModule } from 'src/data/support/billing/billing-data-layer.module';
import { LoggingDataLayerModule } from 'src/data/support/logging/logging.module';
import { MarketingDataLayerModule } from 'src/data/support/marketing/marketing-data-layer.module';
import { OwnerReviewDataLayerModule } from 'src/data/support/owner-review/owner-review-data-layer.module';
import { PaymentDataLayerModule } from 'src/data/support/payment/payment-data-layer.module';
import { PartnerDataLayerModule } from '../../../data/support/partner/partner-data-layer.module';
import { EventListener } from './event.listener';

@Module({
  imports: [
    BillingDataLayerModule,
    PartnerDataLayerModule,
    PaymentDataLayerModule,
    UserDataLayerModule,
    MarketingDataLayerModule,
    OwnerReviewDataLayerModule,
    ProductDataLayerModule,
    LoggingDataLayerModule,
    QueryDataLayerModule,
  ],
  controllers: [],
  providers: [EventListener],
})
export class ListenerPresentationLayerModule {}
