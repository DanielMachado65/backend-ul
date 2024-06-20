import { Module } from '@nestjs/common';
import { FeedbackDataLayerModule } from 'src/data/support/feedback/feedback-data-layer.module';
import { FeedbackContoller } from './feedback.contoller';

@Module({
  imports: [FeedbackDataLayerModule],
  controllers: [FeedbackContoller],
  providers: [],
})
export class FeedbackPresentationLayerModule {}
