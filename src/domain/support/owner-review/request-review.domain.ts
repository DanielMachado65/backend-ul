import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';

export type RequestReviewDomainErrors = ProviderUnavailableDomainError;

export type RequestReviewResult = Either<RequestReviewDomainErrors, void>;

export type RequestReviewIO = EitherIO<RequestReviewDomainErrors, void>;

export abstract class RequestReviewDomain {
  abstract requestReview(email: string, fipeId: string, modelYear: number): RequestReviewIO;
}
