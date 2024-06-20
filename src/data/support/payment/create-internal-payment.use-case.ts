import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Span } from '@alissonfpmorais/rastru';
import { Injectable } from '@nestjs/common';
import { PackageEntity } from 'src/domain/_entity/package.entity';
import { PaymentCreationOrigin, PaymentEntity, PaymentItem, PaymentType } from 'src/domain/_entity/payment.entity';
import { QueryPriceTableEntity, QueryPriceTableTemplateItem } from 'src/domain/_entity/query-price-table.entity';
import {
  CantProcessPaymentDomainError,
  EmptyCartDomainError,
  NoPackageFoundDomainError,
  NoPriceTableFoundDomainError,
  NoQueryFoundDomainError,
  NoUserFoundDomainError,
  ProductUnavailableToUserDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { UserExternalArcTenantControl } from 'src/domain/_entity/user.entity';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { CartDto, CartProductDto, CartProductsDto } from 'src/domain/_layer/data/dto/cart.dto';
import { PackageDto } from 'src/domain/_layer/data/dto/package.dto';
import { PaymentManagementDto } from 'src/domain/_layer/data/dto/payment-management.dto';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { BillingRepository } from 'src/domain/_layer/infrastructure/repository/billing.repository';
import { PackageRepository } from 'src/domain/_layer/infrastructure/repository/package.repository';
import { PaymentManagementRepository } from 'src/domain/_layer/infrastructure/repository/payment-managament.repository';
import { PaymentRepository } from 'src/domain/_layer/infrastructure/repository/payment.repository';
import { PriceTableRepository } from 'src/domain/_layer/infrastructure/repository/price-table.repository';
import { QueryComposerRepository } from 'src/domain/_layer/infrastructure/repository/query-composer.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { ApplyCouponDomain } from 'src/domain/support/payment/apply-coupon.domain';
import {
  CreateInternalPaymentDomain,
  CreateInternalPaymentExtras,
  PaymentIO,
} from 'src/domain/support/payment/create-internal-payment.domain';
import { Currency, CurrencyUtil } from 'src/infrastructure/util/currency.util';
import { CouponDto } from '../../../domain/_layer/data/dto/coupon.dto';
import { PriceTableDto } from '../../../domain/_layer/data/dto/price-table.dto';
import { CouponRepository } from '../../../domain/_layer/infrastructure/repository/coupon.repository';
import { PaymentHelper } from './payment.helper';

export type CreatePaymentNecessaryDataIO = EitherIO<UnknownDomainError, ICreatePaymentNecessaryData>;

export type ProductWithAmount<Product> = { readonly value: Product; readonly amount: number };

export type PriceAmount = {
  readonly realPriceInCents: number;
  readonly totalPriceInCents: number;
};

export interface ICreatePaymentNecessaryData {
  readonly user: UserDto;
  readonly billing: BillingDto;

  readonly priceTable: QueryPriceTableEntity;

  readonly packages: ReadonlyArray<ProductWithAmount<PackageDto>>;
  readonly queries: ReadonlyArray<ProductWithAmount<QueryComposerDto>>;
}

export interface IPaymentParams {
  readonly necessaryData: ICreatePaymentNecessaryData;
  readonly coupon: CouponDto | null;
  readonly paymentItems: ReadonlyArray<PaymentItemWithExtras>;
  readonly priceAmountBeforeCoupon: PriceAmount;
  readonly priceAmount: PriceAmount;
  readonly cnpj: string;
}

type PaymentItemWithExtras = PaymentItem & {
  readonly attributedValueInCents: number;
};

@Injectable()
export class CreateInternalPaymentUseCase implements CreateInternalPaymentDomain {
  private static _unavailableTenantError: string =
    'Usuário não está cadastrado em nenhum gateway de pagamento! Por favor, contate o suporte!';

  constructor(
    private readonly _queryComposerRepository: QueryComposerRepository,
    private readonly _packageRepository: PackageRepository,
    private readonly _paymentRepository: PaymentRepository,
    private readonly _paymentManagementRepository: PaymentManagementRepository,
    private readonly _billingRepository: BillingRepository,
    private readonly _couponRepository: CouponRepository,
    private readonly _priceTableRepository: PriceTableRepository,
    private readonly _userRepository: UserRepository,
    private readonly _currencyUtil: CurrencyUtil,
    private readonly _applyCoupon: ApplyCouponDomain,
    private readonly _paymentHelper: PaymentHelper,
  ) {}

  /**
   * Cria pagamento interno
   */
  @Span('payment-v3')
  call(userId: string, cart: CartDto, paymentType: PaymentType, settings: CreateInternalPaymentExtras): PaymentIO {
    if (CreateInternalPaymentUseCase._isCartEmpty(cart)) return EitherIO.raise(EmptyCartDomainError.toFn());

    type DataLastStep = IPaymentParams;
    type DataStep5 = Omit<DataLastStep, 'priceAmount'>;
    type DataStep4 = Omit<DataStep5, 'coupon'>;
    type DataStep3 = Omit<DataStep4, 'priceAmountBeforeCoupon'>;
    type DataStep2 = Omit<DataStep3, 'paymentItems'>;
    type DataStep1 = Omit<DataStep2, 'cnpj'>;

    return this._getNecessaryData(userId, cart)
      .map(
        (data: ICreatePaymentNecessaryData): DataStep1 => ({
          necessaryData: data,
        }),
      )
      .flatMap((params: DataStep1) => {
        return this._retrieveRightCnpj(params.necessaryData.user).map((cnpj: string) => ({ ...params, cnpj }));
      })
      .flatMap(
        (params: DataStep2): EitherIO<UnknownDomainError, DataStep3> =>
          this._makePaymentItems(params.necessaryData).map((paymentItems: ReadonlyArray<PaymentItemWithExtras>) => ({
            ...params,
            paymentItems,
          })),
      )
      .map(
        (params: DataStep3): DataStep4 => ({
          ...params,
          priceAmountBeforeCoupon: this._calculatePaymentAmount(params.paymentItems),
        }),
      )
      .flatMap((params: DataStep4) => {
        return EitherIO.from(UnknownDomainError.toFn(), () =>
          this._couponRepository.getByIdOrCode(cart.coupon, cart.coupon),
        ).map((coupon: CouponDto) => ({ ...params, coupon }));
      })
      .flatMap((params: DataStep5) => {
        const totalPriceInCents: number = params.priceAmountBeforeCoupon.totalPriceInCents;
        const realPriceInCents: number = params.priceAmountBeforeCoupon.realPriceInCents;
        if (!cart.coupon)
          return EitherIO.of(UnknownDomainError.toFn(), {
            ...params,
            priceAmount: {
              totalPriceInCents: totalPriceInCents,
              realPriceInCents: realPriceInCents,
            },
          });

        return this._applyCoupon
          .applyForCentsWithCoupon(totalPriceInCents, params.coupon, params.necessaryData.billing.id)
          .map(
            (newValue: number): DataLastStep => ({
              ...params,
              priceAmount: {
                totalPriceInCents: newValue,
                realPriceInCents: realPriceInCents,
              },
            }),
          );
      })
      .flatMap((params: IPaymentParams) => this._createPayment(params, paymentType, settings));
  }

  private static _isCartEmpty(cart: CartDto): boolean {
    return (
      cart.products.packages.length === 0 &&
      cart.products.queries.length === 0 &&
      cart.products.subscriptions.length === 0
    );
  }

  /**
   * Get User and his account with pricetable
   * Also gets packages and queries from cart
   */
  private _getNecessaryData(userId: string, cart: CartDto): CreatePaymentNecessaryDataIO {
    type DataLastStep = ICreatePaymentNecessaryData;
    type DataStep2 = Omit<DataLastStep, 'queries'>;
    type DataStep1 = Omit<DataStep2, 'packages'>;

    const products: CartProductsDto = cart.products;
    return EitherIO.from(
      UnknownDomainError.toFn(),
      async (): Promise<Omit<ICreatePaymentNecessaryData, 'queries' | 'packages'>> => {
        const [user, billing, priceTable]: readonly [UserDto, BillingDto, PriceTableDto] = await Promise.all([
          this._userRepository.getById(userId),
          this._billingRepository.getByUser(userId),
          this._priceTableRepository.getUserPriceTable(userId),
        ]);
        return { user, billing, priceTable };
      },
    )
      .filter(NoUserFoundDomainError.toFn(), (partial: DataStep1) => partial.user !== null)
      .filter(NoUserFoundDomainError.toFn(), (partial: DataStep1) => partial.billing !== null)
      .filter(NoPriceTableFoundDomainError.toFn(), (partial: DataStep1) => partial.priceTable !== null)
      .flatMap((partial: DataStep1) =>
        this._getPackages(products.packages).map((packages: ReadonlyArray<ProductWithAmount<PackageDto>>) => ({
          ...partial,
          packages,
        })),
      )
      .flatMap((partial: DataStep2) =>
        this._getQueries(products.queries).map((queries: ReadonlyArray<ProductWithAmount<QueryComposerDto>>) => ({
          ...partial,
          queries,
        })),
      );
  }

  private _retrieveRightCnpj(user: UserDto): EitherIO<UnknownDomainError | CantProcessPaymentDomainError, string> {
    return EitherIO.of(UnknownDomainError.toFn(), user.externalControls.arc.tenants || [])
      .map((tenants: ReadonlyArray<UserExternalArcTenantControl>) =>
        tenants.filter((tenant: UserExternalArcTenantControl) => typeof tenant.id === 'string' && tenant.id !== ''),
      )
      .filter(
        CantProcessPaymentDomainError.toFn({ message: CreateInternalPaymentUseCase._unavailableTenantError }),
        (tenants: ReadonlyArray<UserExternalArcTenantControl>) => tenants.length > 0,
      )
      .flatMap((tenants: ReadonlyArray<UserExternalArcTenantControl>) => {
        return EitherIO.from(UnknownDomainError.toFn(), () => this._paymentManagementRepository.getCurrent()).map(
          (management: PaymentManagementDto) => this._paymentHelper.getTenantCnpj(management, tenants),
        );
      })
      .filter(
        CantProcessPaymentDomainError.toFn({ message: CreateInternalPaymentUseCase._unavailableTenantError }),
        Boolean,
      );
  }

  /**
   * Transforms queries and packages into payment items
   */
  private _makePaymentItems(
    necessaryData: ICreatePaymentNecessaryData,
  ): EitherIO<UnknownDomainError, ReadonlyArray<PaymentItemWithExtras>> {
    return this._queriesToPaymentItems(necessaryData.queries, necessaryData.priceTable).zip(
      this._packagesToPaymentItems(necessaryData.packages),
      (queryItems: ReadonlyArray<PaymentItemWithExtras>, packItems: ReadonlyArray<PaymentItemWithExtras>) =>
        queryItems.concat(packItems),
    );
  }

  /**
   * Converts queries into payment items
   */
  private _queriesToPaymentItems(
    queries: ReadonlyArray<ProductWithAmount<QueryComposerDto>>,
    priceTable: QueryPriceTableEntity,
  ): EitherIO<ProductUnavailableToUserDomainError | UnknownDomainError, ReadonlyArray<PaymentItemWithExtras>> {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      queries.map((query: ProductWithAmount<QueryComposerDto>): PaymentItemWithExtras => {
        const queryPrice: QueryPriceTableTemplateItem = priceTable.template.find(
          (price: QueryPriceTableTemplateItem) => price.queryCode === query.value.queryCode,
        );

        if (!queryPrice) return null;

        const totalValueInCents: number = this._currencyUtil
          .numToCurrency(queryPrice.totalPriceCents, Currency.CENTS_PRECISION)
          .multiply(query.amount)
          .toInt();

        return {
          name: query.value.name,
          attributedValueInCents: totalValueInCents,
          totalValueInCents: totalValueInCents,
          unitValueInCents: queryPrice.totalPriceCents,
          amount: query.amount,
          queryId: query.value.id,
          packageId: null,
          signatureId: null,
        };
      }),
    ).filter(ProductUnavailableToUserDomainError.toFn(), (items: ReadonlyArray<PaymentItemWithExtras>) =>
      items.every((item: PaymentItemWithExtras) => Boolean(item)),
    );
  }

  /**
   * Converts packages into payment items
   */
  private _packagesToPaymentItems(
    packages: ReadonlyArray<ProductWithAmount<PackageDto>>,
  ): EitherIO<UnknownDomainError, ReadonlyArray<PaymentItemWithExtras>> {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      packages.map((pack: ProductWithAmount<PackageDto>): PaymentItemWithExtras => {
        const attributedValueInCents: number = pack.value.attributedValueInCents;
        const valueInCents: number =
          pack.value.purchasePriceInCents !== null ? pack.value.purchasePriceInCents : attributedValueInCents;
        return {
          name: pack.value.name,
          attributedValueInCents: this._currencyUtil
            .numToCurrency(attributedValueInCents, Currency.CENTS_PRECISION)
            .multiply(pack.amount)
            .toInt(),
          totalValueInCents: this._currencyUtil
            .numToCurrency(valueInCents, Currency.CENTS_PRECISION)
            .multiply(pack.amount)
            .toInt(),
          unitValueInCents: valueInCents,
          amount: pack.amount,
          queryId: null,
          packageId: pack.value.id,
          signatureId: null,
        };
      }),
    );
  }

  /**
   * Calculates the real price and total price of a payment based on its items
   */
  private _calculatePaymentAmount(items: ReadonlyArray<PaymentItemWithExtras>): PriceAmount {
    type PriceAmountCurrency = {
      readonly realPrice: Currency;
      readonly totalPrice: Currency;
    };
    const init: PriceAmountCurrency = {
      realPrice: this._currencyUtil.numToCurrency(0),
      totalPrice: this._currencyUtil.numToCurrency(0),
    };
    const priceNoCouponApplied: PriceAmountCurrency = items.reduce<PriceAmountCurrency>(
      ({ realPrice, totalPrice }: PriceAmountCurrency, item: PaymentItemWithExtras): PriceAmountCurrency => {
        return {
          realPrice: realPrice.addValue(item.attributedValueInCents, Currency.CENTS_PRECISION),
          totalPrice: totalPrice.addValue(item.totalValueInCents, Currency.CENTS_PRECISION),
        };
      },
      init,
    );

    return {
      realPriceInCents: priceNoCouponApplied.realPrice.toInt(),
      totalPriceInCents: priceNoCouponApplied.totalPrice.toInt(),
    };
  }

  /**
   * Get the packages from database with their IDs
   */
  private _getPackages(
    rawPackages: readonly CartProductDto[],
  ): EitherIO<UnknownDomainError, ReadonlyArray<ProductWithAmount<PackageEntity>>> {
    const idAmountRelation: Record<string, number> = rawPackages.reduce(
      (acc: Record<string, number>, product: CartProductDto) => {
        const actualAmount: number = acc[product.code] || 0;
        return { ...acc, [product.code]: actualAmount + product.amount };
      },
      {},
    );
    return EitherIO.of(UnknownDomainError.toFn(), idAmountRelation)
      .map(Object.keys)
      .map(this._packageRepository.getBatchByIds.bind(this._packageRepository))
      .filter(
        NoPackageFoundDomainError.toFn(),
        (batch: ReadonlyArray<PackageEntity>) => batch.length === Object.keys(idAmountRelation).length,
      )
      .map((packages: ReadonlyArray<PackageDto>) =>
        packages.map((pack: PackageDto) => ({ value: pack, amount: idAmountRelation[pack.id] })),
      );
  }

  /**
   * Get the queries from database with their Codes
   */
  private _getQueries(
    rawQueries: readonly CartProductDto[],
  ): EitherIO<UnknownDomainError, ReadonlyArray<ProductWithAmount<QueryComposerDto>>> {
    const idAmountRelation: Record<string, number> = rawQueries.reduce(
      (acc: Record<string, number>, product: CartProductDto) => {
        const actualAmount: number = acc[product.code] || 0;
        return { ...acc, [product.code]: actualAmount + product.amount };
      },
      {},
    );
    return EitherIO.of(UnknownDomainError.toFn(), idAmountRelation)
      .map(Object.keys)
      .map(this._queryComposerRepository.getBatchByCodes.bind(this._queryComposerRepository))
      .filter(
        NoQueryFoundDomainError.toFn(),
        (batch: ReadonlyArray<QueryComposerDto>) => batch.length === Object.keys(idAmountRelation).length,
      )
      .map((queries: ReadonlyArray<QueryComposerDto>) =>
        queries.map((query: QueryComposerDto) => ({ value: query, amount: idAmountRelation[query.queryCode] })),
      );
  }

  /**
   * Finally, creates the internal payment with provided params
   */
  private _createPayment(
    params: IPaymentParams,
    paymentType: PaymentType,
    extras: CreateInternalPaymentExtras,
  ): PaymentIO {
    type BuildPayment = Omit<
      PaymentEntity,
      'gateway' | 'id' | 'status' | 'totalPaidInCents' | 'paid' | 'paymentExternalRef' | 'gatewayDetails'
    >;

    return EitherIO.from(UnknownDomainError.toFn(), () => {
      const currentDate: Date = new Date();
      const paymentBuild: BuildPayment = {
        billingId: params.necessaryData.billing.id,
        couponId: params.coupon?.id || null,
        items: params.paymentItems,
        totalPriceWithDiscountInCents: params.priceAmount.totalPriceInCents,
        totalPriceInCents: params.priceAmount.totalPriceInCents,
        realPriceInCents: params.priceAmount.realPriceInCents,
        type: paymentType,
        cnpj: params.cnpj,
        refMonth: currentDate.getMonth(),
        refYear: currentDate.getFullYear(),
        creationOrigin: extras?.origin || PaymentCreationOrigin.UNKNOWN,
      };
      return this._paymentRepository.insert(paymentBuild);
    });
  }
}
