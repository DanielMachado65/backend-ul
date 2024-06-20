import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { FullPaginatedReviewsDto } from 'src/domain/_layer/data/dto/owner-review.dto';
import {
  PaginatedReviewsFiltersInputDto,
  PaginatedReviewsOrdering,
} from 'src/domain/_layer/presentation/dto/get-paginated-reviews-input.dto';
import { PaginationInputDto } from 'src/domain/_layer/presentation/dto/pagination-input.dto';

export type ListOptions = PaginatedReviewsFiltersInputDto & PaginationInputDto;

export type PaginatedReviews = FullPaginatedReviewsDto;

export type ListReviewsDomainDomainErrors = ProviderUnavailableDomainError;

export type ListReviewsDomainResult = Either<ListReviewsDomainDomainErrors, PaginatedReviews>;

export type ListReviewsDomainIO = EitherIO<ListReviewsDomainDomainErrors, PaginatedReviews>;

export type ListOptionsV2 = {
  readonly brandName: string;
  readonly modelName: string;
  readonly modelYear: number;
  readonly fipeId: string;
  readonly ordering: PaginatedReviewsOrdering;
} & PaginationInputDto;

export type PaginatedReviewsV2 = FullPaginatedReviewsDto;

export type ListReviewsV2DomainDomainErrors = ProviderUnavailableDomainError;

export type ListReviewsV2DomainResult = Either<ListReviewsDomainDomainErrors, PaginatedReviewsV2>;

export type ListReviewsV2DomainIO = EitherIO<ListReviewsDomainDomainErrors, PaginatedReviewsV2>;

export abstract class ListReviewsDomain {
  abstract listPaginated(pagination: PaginationInputDto, options: ListOptions): ListReviewsDomainIO;

  abstract listPaginatedV2(pagination: PaginationInputDto, options: ListOptionsV2): ListReviewsDomainIO;
}
