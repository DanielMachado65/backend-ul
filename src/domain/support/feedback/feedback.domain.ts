import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { FeedbackDto } from 'src/domain/_layer/data/dto/feedback.dto';
import { NoServiceFoundDomainError, UnknownDomainError } from '../../_entity/result.error';

export type FeedbackDomainErrors = UnknownDomainError | NoServiceFoundDomainError;

export type FeedbackResult = Either<FeedbackDomainErrors, FeedbackDto>;

export type FeedbackIO = EitherIO<FeedbackDomainErrors, FeedbackDto>;

export abstract class FeedbackDomain {
  readonly sendFeedback: (userId: string, query: string, evaluation: number, description?: string) => FeedbackIO;
}
