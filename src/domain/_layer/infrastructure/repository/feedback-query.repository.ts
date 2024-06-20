import { IBaseRepository } from './base.repository';
import { FeedbackDto, InputFeedbackDto } from '../../data/dto/feedback.dto';

export abstract class FeedbackQueryRepository<TransactionReference = unknown>
  implements IBaseRepository<FeedbackDto, TransactionReference>
{
  abstract getById(id: string): Promise<FeedbackDto | null>;

  abstract insert(inputDto: Partial<FeedbackDto>, transactionReference?: TransactionReference): Promise<FeedbackDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<FeedbackDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<FeedbackDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<FeedbackDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<FeedbackDto>,
    transactionReference?: TransactionReference,
  ): Promise<FeedbackDto | null>;

  abstract count(): Promise<number>;

  abstract findOneByQueryId(userId: string, queryId: string): Promise<FeedbackDto>;

  abstract updateFeedback(inputDto: InputFeedbackDto): Promise<FeedbackDto>;

  abstract sendFeedback(inputDto: InputFeedbackDto): Promise<FeedbackDto>;
}
