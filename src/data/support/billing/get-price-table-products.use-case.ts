import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { PriceTableProductDto } from 'src/domain/_layer/data/dto/price-table.dto';
import { PriceTableRepository } from 'src/domain/_layer/infrastructure/repository/price-table.repository';
import {
  GetPriceTableProductsDomain,
  GetPriceTableProductsDomainIO,
} from 'src/domain/support/billing/get-price-table-products.domain';

@Injectable()
export class GetPriceTableProductsUseCase implements GetPriceTableProductsDomain {
  constructor(private readonly _priceTableRepository: PriceTableRepository) {}

  getProducts(userId?: string): GetPriceTableProductsDomainIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._priceTableRepository.getPriceTableProducts(userId)).map(
      (products: ReadonlyArray<PriceTableProductDto>) => products,
    );
  }
}
