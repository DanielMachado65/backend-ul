import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryPriceTableTemplateItem } from '../../_entity/query-price-table.entity';
import {
  NoPriceTableFoundDomainError,
  ProductUnavailableToUserDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';

export type GetQueryPriceDomainErrors =
  | UnknownDomainError
  | NoPriceTableFoundDomainError
  | ProductUnavailableToUserDomainError;

export type GetQueryPriceResult = Either<GetQueryPriceDomainErrors, QueryPriceTableTemplateItem>;

export type GetQueryPriceIO = EitherIO<GetQueryPriceDomainErrors, QueryPriceTableTemplateItem>;

export abstract class GetQueryPriceDomain {
  readonly getQueryPrice: (queryCode: number, userId?: string) => GetQueryPriceIO;
}
