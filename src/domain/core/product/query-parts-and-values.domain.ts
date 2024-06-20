import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  ProviderNoDataForSelectedVersion,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarQueryPartsAndValues } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';

export type QueryPartsAndValuesDomainErrors =
  | UnknownDomainError
  | CarNotFoundError
  | CarSubscriptionDeactivatedFoundError
  | ProviderUnavailableDomainError
  | ProviderNoDataForSelectedVersion;

export type QueryPartsAndValuesResult = Either<QueryPartsAndValuesDomainErrors, MyCarQueryPartsAndValues>;

export type QueryPartsAndValuesIO = EitherIO<QueryPartsAndValuesDomainErrors, MyCarQueryPartsAndValues>;

export abstract class QueryPartsAndValuesDomain {
  abstract execute(userId: string, carId: string): QueryPartsAndValuesIO;
}
