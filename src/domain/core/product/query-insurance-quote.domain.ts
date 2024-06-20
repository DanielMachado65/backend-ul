import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  ProviderNoDataForSelectedVersion,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarQueryInsuranceQuote } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';

export type QueryInsuranceQuoteDomainErrors =
  | UnknownDomainError
  | CarNotFoundError
  | CarSubscriptionDeactivatedFoundError
  | ProviderUnavailableDomainError
  | ProviderNoDataForSelectedVersion;

export type QueryInsuranceQuoteResult = Either<QueryInsuranceQuoteDomainErrors, MyCarQueryInsuranceQuote>;

export type QueryInsuranceQuoteIO = EitherIO<QueryInsuranceQuoteDomainErrors, MyCarQueryInsuranceQuote>;

export abstract class QueryInsuranceQuoteDomain {
  abstract execute(userId: string, carId: string, zipCode: string): QueryInsuranceQuoteIO;
}
