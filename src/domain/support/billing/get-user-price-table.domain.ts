import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { DetailedPriceTableTemplate } from 'src/domain/_layer/data/dto/price-table.dto';
import {
  NoPriceTableFoundDomainError,
  ProductUnavailableToUserDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';

export type GetUserAllQueryPricesDomainErrors =
  | UnknownDomainError
  | NoPriceTableFoundDomainError
  | ProductUnavailableToUserDomainError;

export type GetUserAllQueryPricesResult = Either<
  GetUserAllQueryPricesDomainErrors,
  ReadonlyArray<DetailedPriceTableTemplate>
>;

export type GetUserAllQueryPricesIO = EitherIO<
  GetUserAllQueryPricesDomainErrors,
  ReadonlyArray<DetailedPriceTableTemplate>
>;

export abstract class GetUserAllQueryPricesDomain {
  readonly getUserAllQueryPrice: (userId?: string, isMobile?: boolean) => GetUserAllQueryPricesIO;
}
