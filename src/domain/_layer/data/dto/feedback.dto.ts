import { FeedbackEntity } from '../../../_entity/feedback.entity';

export type InputFeedbackDto = {
  readonly userId: string;
  readonly queryId: string;
  readonly evaluation: number;
  readonly description?: string;
  readonly refMonth: number;
  readonly refYear: number;
};

export type FeedbackDto = FeedbackEntity;
