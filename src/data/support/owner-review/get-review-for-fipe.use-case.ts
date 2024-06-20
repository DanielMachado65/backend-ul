import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { GetReviewForFipeDomain, GetReviewForFipeIO } from 'src/domain/support/owner-review/get-review-for-fipe.domain';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';

@Injectable()
export class GetReviewForFipeUseCase implements GetReviewForFipeDomain {
  constructor(private readonly _ownerReviewService: OwnerReviewService) {}

  getReviewForFipe(fipeId: string): GetReviewForFipeIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._ownerReviewService.getReviewByFipeId(fipeId),
    );
  }
}
