import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';

export type EngageResult = {
  readonly like: number;
  readonly dislike: number;
};

export type GetReviewEngagementDomainErrors = ProviderUnavailableDomainError;

export type GetReviewEngagementResult = Either<GetReviewEngagementDomainErrors, EngageResult>;

export type GetReviewEngagementIO = EitherIO<GetReviewEngagementDomainErrors, EngageResult>;

export abstract class GetReviewEngagementDomain {
  abstract getAnonymouslyEngagement(reviewId: string): GetReviewEngagementIO;
}
