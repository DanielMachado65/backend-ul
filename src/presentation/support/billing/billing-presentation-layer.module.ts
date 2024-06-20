import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingDataLayerModule } from '../../../data/support/billing/billing-data-layer.module';
import { SubscriptionController } from './subscription.controller';

@Module({
  imports: [BillingDataLayerModule],
  controllers: [BillingController, SubscriptionController],
  providers: [],
})
export class BillingPresentationLayerModule {}
