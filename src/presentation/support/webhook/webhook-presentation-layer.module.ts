/* eslint-disable functional/prefer-readonly-type */
import { Module } from '@nestjs/common';
import { PaymentDataLayerModule } from 'src/data/support/payment/payment-data-layer.module';
import { WebhookController } from './webhook.controller';
import { BillingDataLayerModule } from 'src/data/support/billing/billing-data-layer.module';

@Module({
  imports: [PaymentDataLayerModule, BillingDataLayerModule],
  controllers: [WebhookController],
  providers: [],
})
export class WebhookPresentationLayerModule {}
