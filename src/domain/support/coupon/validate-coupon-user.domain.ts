import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { CouponProductsInputDto } from 'src/domain/_layer/presentation/dto/coupon-products-input.dto';
import { CouponProductsOutputDto } from 'src/domain/_layer/presentation/dto/coupon-products-output.dto';

export type ValidateCouponErrors = UnknownDomainError;

export type ValidateCouponResult = Either<ValidateCouponErrors, CouponProductsOutputDto>;

export type ValidateCouponIO = EitherIO<ValidateCouponErrors, CouponProductsOutputDto>;

export abstract class ValidateCouponUserDomain {
  abstract call(code: string, products: CouponProductsInputDto): ValidateCouponIO;
}
