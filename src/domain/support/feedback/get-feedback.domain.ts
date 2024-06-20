import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { FeedbackDto } from 'src/domain/_layer/data/dto/feedback.dto';
import { NoServiceFoundDomainError, UnknownDomainError } from '../../_entity/result.error';

export type GetFeedbackDomainErrors = UnknownDomainError | NoServiceFoundDomainError;

export type GetFeedbackResult = Either<GetFeedbackDomainErrors, FeedbackDto>;

export type GetFeedbackIO = EitherIO<GetFeedbackDomainErrors, FeedbackDto>;

export abstract class GetFeedbackDomain {
  readonly getFeedback: (userId: string, queryId: string) => GetFeedbackIO;
}
