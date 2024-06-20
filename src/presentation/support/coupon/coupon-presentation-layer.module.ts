import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponDataLayerModule } from '../../../data/support/coupon/coupon-data-layer.module';

@Module({
  imports: [CouponDataLayerModule],
  controllers: [CouponController],
  providers: [],
})
export class CouponPresentationLayerModule {}
