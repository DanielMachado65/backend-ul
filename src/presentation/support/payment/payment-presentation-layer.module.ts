import { Module } from '@nestjs/common';
import { UserDataLayerModule } from 'src/data/core/user/user-data-layer.module';
import { PaymentDataLayerModule } from '../../../data/support/payment/payment-data-layer.module';
import { PaymentControllerV3 } from './payment-v3.controller';
import { PaymentController } from './payment.controller';

@Module({
  imports: [PaymentDataLayerModule, UserDataLayerModule],
  controllers: [PaymentController, PaymentControllerV3],
  providers: [],
})
export class PaymentPresentationLayerModule {}
