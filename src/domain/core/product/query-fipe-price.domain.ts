import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  ProviderNoDataForSelectedVersion,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarQueryPriceFIPE } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';

export type QueryFipePriceDomainErrors =
  | UnknownDomainError
  | CarNotFoundError
  | CarSubscriptionDeactivatedFoundError
  | ProviderUnavailableDomainError
  | ProviderNoDataForSelectedVersion;

export type QueryFipePriceResult = Either<QueryFipePriceDomainErrors, MyCarQueryPriceFIPE>;

export type QueryFipePriceIO = EitherIO<QueryFipePriceDomainErrors, MyCarQueryPriceFIPE>;

export abstract class QueryFipePriceDomain {
  abstract execute(userId: string, carId: string): QueryFipePriceIO;
}
