import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import {
  OwnerReviewService,
  ReviewListOrderBy,
  ReviewListSortBy,
} from 'src/domain/_layer/infrastructure/service/owner-review.service';
import {
  PaginatedReviewsFiltersInputDto,
  PaginatedReviewsOrdering,
} from 'src/domain/_layer/presentation/dto/get-paginated-reviews-input.dto';
import { PaginationInputDto } from 'src/domain/_layer/presentation/dto/pagination-input.dto';
import {
  ListOptionsV2,
  ListReviewsDomain,
  ListReviewsDomainIO,
  ListReviewsV2DomainIO,
} from 'src/domain/support/owner-review/list-reviews.domain';

type SortOrder = {
  readonly sort: ReviewListSortBy;
  readonly order: ReviewListOrderBy;
};

@Injectable()
export class ListReviewsUseCase implements ListReviewsDomain {
  constructor(private readonly _ownerReviewService: OwnerReviewService) {}

  listPaginated(pagination: PaginationInputDto, options: PaginatedReviewsFiltersInputDto): ListReviewsDomainIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () => {
      const { sort, order }: SortOrder = this._getSortAndOrder(options.ordering);
      return this._ownerReviewService.listPaginated({
        sortBy: sort,
        orderBy: order,
        brandName: options.brandName,
        modelName: options.modelName,
        yearModel: options.modelYear,
        detailedModel: options.detailedModel,
        page: pagination.page,
        perPage: pagination.perPage,
      });
    });
  }

  listPaginatedV2(pagination: PaginationInputDto, options: ListOptionsV2): ListReviewsV2DomainIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () => {
      const { sort, order }: SortOrder = this._getSortAndOrder(options.ordering);
      return this._ownerReviewService.listPaginatedByVersion({
        sortBy: sort,
        orderBy: order,
        fipeId: options.fipeId,
        page: pagination.page,
        perPage: pagination.perPage,
      });
    });
  }

  private _getSortAndOrder(ordering: PaginatedReviewsOrdering): SortOrder {
    switch (ordering) {
      case PaginatedReviewsOrdering.MOST_RATED:
        return { sort: ReviewListSortBy.RATE, order: ReviewListOrderBy.DESC };
      case PaginatedReviewsOrdering.RECENT:
        return { sort: ReviewListSortBy.DATE, order: ReviewListOrderBy.DESC };
      case PaginatedReviewsOrdering.OLD:
        return { sort: ReviewListSortBy.DATE, order: ReviewListOrderBy.ASC };
      case PaginatedReviewsOrdering.HIGH_SCORE:
        return { sort: ReviewListSortBy.AVG_SCORE, order: ReviewListOrderBy.DESC };
      case PaginatedReviewsOrdering.LOW_SCORE:
        return { sort: ReviewListSortBy.AVG_SCORE, order: ReviewListOrderBy.ASC };
      case PaginatedReviewsOrdering.HIGH_KM:
        return { sort: ReviewListSortBy.KM, order: ReviewListOrderBy.DESC };
      case PaginatedReviewsOrdering.LOW_KM:
        return { sort: ReviewListSortBy.KM, order: ReviewListOrderBy.ASC };
      default:
        return { sort: ReviewListSortBy.AVG_SCORE, order: ReviewListOrderBy.ASC };
    }
  }
}
