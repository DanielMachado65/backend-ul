import { Module, Provider } from '@nestjs/common';
import { CountCouponsCreatedByUserUseCase } from './count-coupons-created-by-user.use-case';
import { CountCouponsCreatedByUserDomain } from 'src/domain/support/coupon/count-coupons-created-by-user.domain';
import { ValidateCouponUserDomain } from 'src/domain/support/coupon/validate-coupon-user.domain';
import { ValidateCouponUserUseCase } from './validate-coupon-user.use-case';
import { ProductsHelper } from '../payment/product.helper';

const useCases: ReadonlyArray<Provider> = [
  ProductsHelper,
  { provide: CountCouponsCreatedByUserDomain, useClass: CountCouponsCreatedByUserUseCase },
  { provide: ValidateCouponUserDomain, useClass: ValidateCouponUserUseCase },
];

@Module({
  imports: [],
  controllers: [],
  providers: [...useCases],
  exports: [...useCases],
})
export class CouponDataLayerModule {}
