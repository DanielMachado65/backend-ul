import { Module, Provider } from '@nestjs/common';
import { FeedbackDomain } from '../../../domain/support/feedback/feedback.domain';
import { GetFeedbackDomain } from '../../../domain/support/feedback/get-feedback.domain';
import { FeedbackUseCase } from '../feedback/feedback.usecase';
import { GetFeedbackUseCase } from '../feedback/get-feedback.usecase';

const sendFeedbackProvider: Provider = {
  provide: FeedbackDomain,
  useClass: FeedbackUseCase,
};

const getFeedbackProvider: Provider = {
  provide: GetFeedbackDomain,
  useClass: GetFeedbackUseCase,
};

@Module({
  imports: [],
  controllers: [],
  providers: [sendFeedbackProvider, getFeedbackProvider],
  exports: [sendFeedbackProvider, getFeedbackProvider],
})
export class FeedbackDataLayerModule {}
