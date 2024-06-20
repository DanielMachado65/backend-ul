import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarQueryOwnerReview } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';

export type QueryOwnerReviewDomainErrors =
  | UnknownDomainError
  | CarNotFoundError
  | CarSubscriptionDeactivatedFoundError
  | ProviderUnavailableDomainError;

export type QueryOwnerReviewResult = Either<QueryOwnerReviewDomainErrors, MyCarQueryOwnerReview>;

export type QueryOwnerReviewIO = EitherIO<QueryOwnerReviewDomainErrors, MyCarQueryOwnerReview>;

export abstract class QueryOwnerReviewDomain {
  abstract execute(userId: string, carId: string): QueryOwnerReviewIO;
}
