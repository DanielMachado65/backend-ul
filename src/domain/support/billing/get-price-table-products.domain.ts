import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { PriceTableProductDto } from 'src/domain/_layer/data/dto/price-table.dto';
import {
  NoPriceTableFoundDomainError,
  ProductUnavailableToUserDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';

export type GetPriceTableProductsDomainErrors =
  | UnknownDomainError
  | NoPriceTableFoundDomainError
  | ProductUnavailableToUserDomainError;

export type GetPriceTableProductsDomainResult = Either<
  GetPriceTableProductsDomainErrors,
  ReadonlyArray<PriceTableProductDto>
>;

export type GetPriceTableProductsDomainIO = EitherIO<
  GetPriceTableProductsDomainErrors,
  ReadonlyArray<PriceTableProductDto>
>;

export abstract class GetPriceTableProductsDomain {
  readonly getProducts: (userId?: string) => GetPriceTableProductsDomainIO;
}
