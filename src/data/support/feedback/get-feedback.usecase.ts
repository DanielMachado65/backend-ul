import { Injectable } from '@nestjs/common';
import { EitherIO } from '@alissonfpmorais/minimal_fp';

import { GetFeedbackDomain, GetFeedbackIO } from 'src/domain/support/feedback/get-feedback.domain';
import { FeedbackQueryRepository } from '../../../domain/_layer/infrastructure/repository/feedback-query.repository';
import { UnknownDomainError } from 'src/domain/_entity/result.error';

@Injectable()
export class GetFeedbackUseCase implements GetFeedbackDomain {
  constructor(private readonly _feedbackRepository: FeedbackQueryRepository) {}

  getFeedback(userId: string, queryId: string): GetFeedbackIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () => {
      return await this._feedbackRepository.findOneByQueryId(userId, queryId);
    });
  }
}
