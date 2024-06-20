import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  NoPackageFoundDomainError,
  NoQueryFoundDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { CartProductDto } from 'src/domain/_layer/data/dto/cart.dto';
import { ProductWithAmount } from './create-internal-payment.use-case';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { QueryComposerRepository } from 'src/domain/_layer/infrastructure/repository/query-composer.repository';
import { PackageRepository } from 'src/domain/_layer/infrastructure/repository/package.repository';
import { PackageEntity } from 'src/domain/_entity/package.entity';
import { PackageDto } from 'src/domain/_layer/data/dto/package.dto';

@Injectable()
export class ProductsHelper {
  constructor(
    private readonly _queryComposerRepository: QueryComposerRepository,
    private readonly _packageRepository: PackageRepository,
  ) {}

  /**
   * Get the queries from database with their Codes
   */
  getQueries(
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
   * Get the packages from database with their IDs
   */
  getPackages(
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
}
