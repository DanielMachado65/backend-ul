import { Injectable } from '@nestjs/common';
import {
  RequestOwnerReviewQueryDomain,
  RequestOwnerReviewQueryIO,
  VehicleModel,
} from 'src/domain/support/owner-review/request-owner-review-query.domain';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';

@Injectable()
export class RequestOwnerReviewQueryUseCase implements RequestOwnerReviewQueryDomain {
  constructor(
    private readonly _queryRequestService: QueryRequestService,
    private readonly _ownerReviewService: OwnerReviewService,
  ) {}

  requestOwnerReviewQuery(model: VehicleModel): RequestOwnerReviewQueryIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), async () => {
      await this._queryRequestService.requestQuery({
        templateQueryRef: '2323',
        queryRef: `uluru_review_v2-${model.fipeId}-${model.modelYear}-${new Date().getTime()}`,
        keys: {
          modelYear: model.modelYear,
          fipeIds: [model.fipeId],
          fipeId: model.fipeId,
          year: model.modelYear,
        },
      });
    });
  }
}
