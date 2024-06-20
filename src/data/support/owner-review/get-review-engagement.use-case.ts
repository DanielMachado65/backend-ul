import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import {
  GetReviewEngagementDomain,
  GetReviewEngagementIO,
} from 'src/domain/support/owner-review/get-review-engagement.domain';

@Injectable()
export class GetReviewEngagementUseCase implements GetReviewEngagementDomain {
  constructor(private readonly _ownerReviewService: OwnerReviewService) {}

  getAnonymouslyEngagement(reviewId: string): GetReviewEngagementIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._ownerReviewService.getAnonymouslyEngagement(reviewId),
    );
  }
}
