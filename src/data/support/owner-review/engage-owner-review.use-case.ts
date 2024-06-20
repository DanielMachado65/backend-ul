import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import {
  EngageOwnerReviewDomain,
  EngageOwnerReviewIO,
} from 'src/domain/support/owner-review/engage-owner-review.domain';

@Injectable()
export class EngageOwnerReviewUseCase implements EngageOwnerReviewDomain {
  constructor(private readonly _ownerReviewService: OwnerReviewService) {}

  anonymouslyEngage(reviewId: string, type: 'like' | 'dislike'): EngageOwnerReviewIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._ownerReviewService.anonymouslyEngage(reviewId, type),
    );
  }
}
