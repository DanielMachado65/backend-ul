import {
  SaveReceivedReviewDatasheetQueryDomain,
  SaveReceivedReviewDatasheetQueryIO,
} from 'src/domain/support/owner-review/save-received-review-datasheet-query.domain';
import { QueryResponseEntity } from 'src/domain/_entity/query-response.entity';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { Injectable } from '@nestjs/common';
import { OwnerReviewModelRepository } from 'src/domain/_layer/infrastructure/repository/owner-review-model.repository';

@Injectable()
export class SaveReceivedReviewDatasheetQueryUseCase implements SaveReceivedReviewDatasheetQueryDomain {
  constructor(private readonly _ownerReviewModelRepository: OwnerReviewModelRepository) {}

  saveResponse(response: QueryResponseEntity): SaveReceivedReviewDatasheetQueryIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () =>
      this._ownerReviewModelRepository.insertModel(response.keys.fipeId, response.keys.modelYear, {
        vehicle: response.response,
      }),
    );
  }
}
