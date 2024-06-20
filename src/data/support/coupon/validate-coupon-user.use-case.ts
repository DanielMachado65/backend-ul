import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { CouponEntity } from 'src/domain/_entity/coupon.entity';
import { NoCouponFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { CouponRepository } from 'src/domain/_layer/infrastructure/repository/coupon.repository';
import { ValidateCouponIO, ValidateCouponUserDomain } from 'src/domain/support/coupon/validate-coupon-user.domain';
import { CouponValidationHelper } from '../payment/coupon-validation-helper';
import { Currency, CurrencyUtil } from 'src/infrastructure/util/currency.util';
import {
  CouponItemPackage,
  CouponProductsInputDto,
} from 'src/domain/_layer/presentation/dto/coupon-products-input.dto';
import { CouponProductsOutputDto } from 'src/domain/_layer/presentation/dto/coupon-products-output.dto';
import { ProductsHelper } from '../payment/product.helper';
import { CartProductDto } from 'src/domain/_layer/data/dto/cart.dto';
import { PackageEntity } from 'src/domain/_entity/package.entity';
import { ProductWithAmount } from '../payment/create-internal-payment.use-case';
import { QueryComposerEntity } from 'src/domain/_entity/query-composer.entity';

type ValidateCoupon = {
  coupon: CouponEntity;
  totalPrice: Currency;
  totalAmount: number;
};

type CombinedProducts = {
  packages: ProductWithAmount<PackageEntity>[];
  queries: ProductWithAmount<QueryComposerEntity>[];
};

type CouponWithPackagesQueries = CombinedProducts & ValidateCoupon;

@Injectable()
export class ValidateCouponUserUseCase implements ValidateCouponUserDomain {
  constructor(
    private readonly _couponRepository: CouponRepository,
    private readonly _currencyUtil: CurrencyUtil,
    private readonly _productsHelper: ProductsHelper,
  ) {}

  call(code: string, products: CouponProductsInputDto): ValidateCouponIO {
    return EitherIO.from(UnknownDomainError.toFn(), this._findCouponByCode(code))
      .filter(NoCouponFoundDomainError.toFn(), (coupon: CouponEntity) => Boolean(coupon))
      .flatMap((coupon: CouponEntity) => this._findProducts(coupon, products))
      .flatMap((couponWithPackagesQueries: CouponWithPackagesQueries) => {
        const { totalAmount, coupon, totalPrice }: CouponWithPackagesQueries = couponWithPackagesQueries;
        return CouponValidationHelper.canUse(totalPrice, coupon, totalAmount).map(() =>
          this._prepareOutput(couponWithPackagesQueries),
        );
      });
  }

  private _prepareOutput(dto: CouponWithPackagesQueries): CouponProductsOutputDto {
    const discountValue: Currency = this._currencyUtil.numToCurrency(
      dto.coupon.rules.discountValueInCents,
      Currency.CENTS_PRECISION,
    );
    const priceWithDiscount: Currency = dto.totalPrice.add(discountValue.multiply(-1));

    return {
      couponId: dto.coupon.id,
      couponCode: dto.coupon.code,
      discountValueInCents: dto.coupon.rules.discountValueInCents,
      totalPriceInCents: priceWithDiscount.toInt(),
      totalPriceWithoutDiscountInCents: dto.totalPrice.toInt(),
      packages: dto.packages.map((item: ProductWithAmount<PackageEntity>) => ({
        id: item.value.id,
        amount: item.amount,
      })),
      queries: dto.queries.map((item: ProductWithAmount<QueryComposerEntity>) => ({
        code: item.value.id,
        amount: item.amount,
      })),
    };
  }

  private _findCouponByCode(code: string) {
    return async (): Promise<CouponEntity> => await this._couponRepository.getByCode(code);
  }

  private _findProducts(
    coupon: CouponEntity,
    products: CouponProductsInputDto,
  ): EitherIO<UnknownDomainError, CouponWithPackagesQueries> {
    const cartProducts: CartProductDto[] = products.packages.map((item: CouponItemPackage) => ({
      code: item.id,
      amount: item.amount,
    }));
    return this._productsHelper.getPackages(cartProducts).flatMap((packages: ProductWithAmount<PackageEntity>[]) => {
      return this._productsHelper
        .getQueries(products.queries)
        .map((queries: ProductWithAmount<QueryComposerEntity>[]) => {
          const totalPrice: Currency = this._calculateTotalPrice({ packages, queries });

          return {
            coupon,
            totalPrice: totalPrice,
            totalAmount: this._calculateTotalAmount({ packages, queries }),
            packages,
            queries,
          };
        });
    });
  }

  private _calculateTotalPrice(products: CombinedProducts): Currency {
    const packageTotal: Currency = products.packages.reduce(
      (sum: Currency, pkg: ProductWithAmount<PackageEntity>) =>
        this._currencyUtil
          .numToCurrency(pkg.value.purchasePriceInCents, Currency.CENTS_PRECISION)
          .multiply(pkg.amount)
          .add(sum),
      this._currencyUtil.numToCurrency(0, Currency.CENTS_PRECISION),
    );
    const queryTotal: Currency = products.queries.reduce(
      (sum: Currency, query: ProductWithAmount<QueryComposerEntity>) =>
        this._currencyUtil
          .numToCurrency(query.value.queryCode, Currency.CENTS_PRECISION)
          .multiply(query.amount)
          .add(sum),
      this._currencyUtil.numToCurrency(0, Currency.CENTS_PRECISION),
    );
    return packageTotal.add(queryTotal);
  }

  private _calculateTotalAmount(products: CombinedProducts): number {
    const packageAmount: number = products.packages.reduce(
      (sum: number, pkg: ProductWithAmount<PackageEntity>) => sum + pkg.amount,
      0,
    );
    const queryAmount: number = products.queries.reduce(
      (sum: number, query: ProductWithAmount<QueryComposerEntity>) => sum + query.amount,
      0,
    );
    return packageAmount + queryAmount;
  }
}
