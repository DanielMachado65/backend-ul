import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';

export type SendQueryToMarketingDomainErrors = UnknownDomainError;

export type SendQueryToMarketingResult = Either<SendQueryToMarketingDomainErrors, true>;

export type SendQueryToMarketingIO = EitherIO<SendQueryToMarketingDomainErrors, true>;

export abstract class SendQueryToMarketingDomain {
  abstract send(queryId: string): SendQueryToMarketingIO;
}
