import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { PackageEntity } from 'src/domain/_entity/package.entity';
import {
  EmptyCartDomainError,
  NoPackageFoundDomainError,
  NoPriceTableFoundDomainError,
  NoQueryFoundDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { CartDto, CartProductDto } from 'src/domain/_layer/data/dto/cart.dto';
import { PackageDto } from 'src/domain/_layer/data/dto/package.dto';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { TrackPaymentInitPayloadDto } from 'src/domain/_layer/data/dto/track-payment-init-payload.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { MarkintingService } from 'src/domain/_layer/infrastructure/service/marketing.service';
import { TrackCheckoutInitDomain, TrackCheckoutInitIO } from 'src/domain/support/payment/track-checkout-init.domain';
import { StringUtil } from 'src/infrastructure/util/string.util';
import { ProductWithAmount } from '../payment/create-internal-payment.use-case';
import { PackageRepository } from 'src/domain/_layer/infrastructure/repository/package.repository';
import { QueryComposerRepository } from 'src/domain/_layer/infrastructure/repository/query-composer.repository';
import { QueryComposerEntity } from 'src/domain/_entity/query-composer.entity';
import { QueryPriceTableTemplateItem } from 'src/domain/_entity/query-price-table.entity';
import { PriceTableRepository } from 'src/domain/_layer/infrastructure/repository/price-table.repository';
import { PriceTableDto } from 'src/domain/_layer/data/dto/price-table.dto';

const SEPARATOR: string = ' - ';

type ProductWithAmountAndPrice<Type> = ProductWithAmount<Type> & { unitPriceInCents: number };

type FetchProducts = {
  packages: ProductWithAmount<PackageEntity>[];
  queries: ProductWithAmountAndPrice<QueryComposerEntity>[];
};

@Injectable()
export class TrackCheckoutInitUseCase implements TrackCheckoutInitDomain {
  constructor(
    private readonly _markintingService: MarkintingService,
    private readonly _userRepository: UserRepository,
    private readonly _packageRepository: PackageRepository,
    private readonly _queryComposerRepository: QueryComposerRepository,
    private readonly _priceTableRepository: PriceTableRepository,
  ) {}

  track(userId: string, { cart }: TrackPaymentInitPayloadDto): TrackCheckoutInitIO {
    if (cart.products.queries.length === 0 && cart.products.packages.length === 0)
      return EitherIO.raise(EmptyCartDomainError.toFn());

    return EitherIO.from(NoUserFoundDomainError.toFn(), () => this._userRepository.getById(userId))
      .flatMap((user: UserDto) =>
        this._fetchProducts(cart, user).map((fetchProducts: FetchProducts) => [user, fetchProducts]),
      )
      .flatMap(([user, fetchProducts]: [UserDto, FetchProducts]) => this._execute(user, fetchProducts));
  }

  _execute(user: UserDto, fetchProducts: FetchProducts): EitherIO<UnknownDomainError, void> {
    return EitherIO.from(UnknownDomainError.toFn(), async (): Promise<void> => {
      const date: Date = user.createdAt ? new Date(user.createdAt) : null;
      await this._markintingService.registerUserInitPaid({
        birthday: date
          ? `${date.getMonth().toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
          : '01/01',
        email: user.email,
        firstName: StringUtil.firstName(user.name),
        lastName: StringUtil.lastName(user.name),
        phone: user.phoneNumber,
        pricePay: (
          fetchProducts.packages
            .map((p: ProductWithAmount<PackageEntity>) => p.amount * p.value.purchasePriceInCents)
            .concat(
              fetchProducts.queries.map(
                (p: ProductWithAmountAndPrice<QueryComposerEntity>) => p.amount * p.unitPriceInCents,
              ),
            )
            .reduce((a: number, b: number) => a + b) / 100
        ).toFixed(2),
        purchase: [
          fetchProducts.packages.map((p: ProductWithAmount<PackageEntity>) => p.value.name).join(SEPARATOR),
          fetchProducts.queries.map((p: ProductWithAmount<QueryComposerEntity>) => p.value.name).join(SEPARATOR),
        ]
          .filter(Boolean)
          .join(SEPARATOR),
      });
    });
  }

  private _fetchProducts(cart: CartDto, user: UserDto): EitherIO<UnknownDomainError, FetchProducts> {
    return this._getQueries(cart.products.queries, user).flatMap(
      (queries: ProductWithAmountAndPrice<QueryComposerEntity>[]) =>
        this._getPackages(cart.products.packages).map((packages: ProductWithAmount<PackageEntity>[]) => ({
          queries,
          packages,
        })),
    );
  }

  /**
   * Get the packages from database with their IDs
   */
  private _getPackages(
    rawPackages: readonly CartProductDto[],
  ): EitherIO<UnknownDomainError, ProductWithAmount<PackageEntity>[]> {
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
    user: UserDto,
  ): EitherIO<UnknownDomainError, ProductWithAmountAndPrice<QueryComposerDto>[]> {
    const idAmountRelation: Record<string, number> = rawQueries.reduce(
      (acc: Record<string, number>, product: CartProductDto) => {
        const actualAmount: number = acc[product.code] || 0;
        return { ...acc, [product.code]: actualAmount + product.amount };
      },
      {},
    );

    return EitherIO.from(NoPriceTableFoundDomainError.toFn(), () =>
      this._priceTableRepository.getUserPriceTable(user.id),
    ).flatMap((priceTable: PriceTableDto) =>
      EitherIO.of(UnknownDomainError.toFn(), idAmountRelation)
        .map(Object.keys)
        .map(this._queryComposerRepository.getBatchByCodes.bind(this._queryComposerRepository))
        .filter(
          NoQueryFoundDomainError.toFn(),
          (batch: ReadonlyArray<QueryComposerDto>) => batch.length === Object.keys(idAmountRelation).length,
        )
        .map((queries: ReadonlyArray<QueryComposerDto>) =>
          queries.map((query: QueryComposerDto) => {
            const queryPrice: QueryPriceTableTemplateItem = priceTable.template.find(
              (price: QueryPriceTableTemplateItem) => price.queryCode === query.queryCode,
            );

            return {
              value: query,
              amount: idAmountRelation[query.queryCode],
              unitPriceInCents: queryPrice.totalPriceCents,
            };
          }),
        ),
    );
  }
}
