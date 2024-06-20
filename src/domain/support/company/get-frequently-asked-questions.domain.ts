import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { FaqEssentialsDto } from 'src/domain/_layer/data/dto/faq.dto';

export type AllFrequentlyAskedQuestionDomainErrors = UnknownDomainError;

export type AllFrequentlyAskedQuestionIO = EitherIO<
  AllFrequentlyAskedQuestionDomainErrors,
  ReadonlyArray<FaqEssentialsDto>
>;

export abstract class GetFrequentlyAskedQuestionsDomain {
  abstract getAll(): AllFrequentlyAskedQuestionIO;
}
