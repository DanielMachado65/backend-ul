import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { FeedbackDto } from 'src/domain/_layer/data/dto/feedback.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { FeedbackQueryRepository } from 'src/domain/_layer/infrastructure/repository/feedback-query.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { MarkintingService } from 'src/domain/_layer/infrastructure/service/marketing.service';
import { FeedbackDomain, FeedbackIO } from 'src/domain/support/feedback/feedback.domain';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';

@Injectable()
export class FeedbackUseCase implements FeedbackDomain {
  constructor(
    private readonly _feedbackRepository: FeedbackQueryRepository,
    private readonly _dateTimeUtil: DateTimeUtil,
    private readonly _markintingService: MarkintingService,
    private readonly _userRepository: UserRepository,
  ) {}

  private _getRefMonth(): number {
    return this._dateTimeUtil.now().getMonth();
  }

  private _getRefYear(): number {
    return this._dateTimeUtil.now().getYear();
  }

  private async _sendFeedbackLogic(
    userId: string,
    queryId: string,
    evaluation: number,
    description?: string,
  ): Promise<FeedbackDto> {
    return await this._feedbackRepository.sendFeedback({
      queryId: queryId,
      userId: userId,
      evaluation: evaluation,
      description: description,
      refMonth: this._getRefMonth(),
      refYear: this._getRefYear(),
    });
  }

  private _registerFeedback(userId: string) {
    return async (feedback: FeedbackDto): Promise<void> => {
      const user: UserDto = await this._userRepository.getById(userId);

      await this._markintingService.registerFeedbackQuery({
        email: user.email,
        evaluation: feedback.evaluation,
      });
    };
  }

  sendFeedback(userId: string, queryId: string, evaluation: number, description?: string): FeedbackIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._sendFeedbackLogic(userId, queryId, evaluation, description),
    ).tap(this._registerFeedback(userId));
  }
}
