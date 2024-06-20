import { Injectable } from '@nestjs/common';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { GetOwnerReviewsDomain, GetOwnerReviewIO } from '../../../domain/support/owner-review/get-owner-reviews.domain';
import { OwnerReviewService } from '../../../domain/_layer/infrastructure/service/owner-review.service';
import { ProviderUnavailableDomainError } from '../../../domain/_entity/result.error';

@Injectable()
export class GetOwnerReviewsUseCase implements GetOwnerReviewsDomain {
  constructor(private readonly _ownerReviewService: OwnerReviewService) {}

  getOwnerReviews(brandModelCode: string, fipeId: string, page: number, perPage: number): GetOwnerReviewIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._ownerReviewService.getOwnerReviews(brandModelCode, fipeId, page, perPage),
    );
  }
}
