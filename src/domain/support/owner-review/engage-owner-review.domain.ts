import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';

export type EngageResult = {
  readonly like: number;
  readonly dislike: number;
};

export type EngageOwnerReviewDomainErrors = ProviderUnavailableDomainError;

export type EngageOwnerReviewResult = Either<EngageOwnerReviewDomainErrors, EngageResult>;

export type EngageOwnerReviewIO = EitherIO<EngageOwnerReviewDomainErrors, EngageResult>;

export abstract class EngageOwnerReviewDomain {
  abstract anonymouslyEngage(reviewId: string, type: 'like' | 'dislike'): EngageOwnerReviewIO;
}
