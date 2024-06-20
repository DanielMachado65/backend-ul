import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { OwnerReviewDto } from '../../_layer/data/dto/owner-review.dto';
import { PaginationOf } from '../../_layer/data/dto/pagination.dto';

export type GetOwnerReviewDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type GetOwnerReviewResult = Either<GetOwnerReviewDomainErrors, PaginationOf<OwnerReviewDto>>;

export type GetOwnerReviewIO = EitherIO<GetOwnerReviewDomainErrors, PaginationOf<OwnerReviewDto>>;

export abstract class GetOwnerReviewsDomain {
  readonly getOwnerReviews: (brandModelCode: string, fipeId: string, page: number, perPage: number) => GetOwnerReviewIO;
}
