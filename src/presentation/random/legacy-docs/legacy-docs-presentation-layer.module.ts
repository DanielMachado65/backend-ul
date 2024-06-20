import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { PaymentController } from './payment.controller';
import { LegacyTestDriveController } from './test-drive.controller';
import { IndicateAndEarnController } from './indicate-and-earn.controller';

@Module({
  imports: [],
  controllers: [CouponController, PaymentController, LegacyTestDriveController, IndicateAndEarnController],
  providers: [],
})
export class LegacyDocsPresentationLayerModule {}
