import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryResponseEntity } from 'src/domain/_entity/query-response.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';

export type SaveReceivedReviewDatasheetQueryDomainErrors = UnknownDomainError;

export type SaveReceivedReviewDatasheetQueryResult = Either<SaveReceivedReviewDatasheetQueryDomainErrors, unknown>;

export type SaveReceivedReviewDatasheetQueryIO = EitherIO<SaveReceivedReviewDatasheetQueryDomainErrors, unknown>;

export abstract class SaveReceivedReviewDatasheetQueryDomain {
  static readonly QUERY_CODE: number = 2323;

  abstract saveResponse(response: QueryResponseEntity): SaveReceivedReviewDatasheetQueryIO;
}
