import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryEntity } from 'src/domain/_entity/query.entity';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';

export type ReprocessQueryDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type ReprocessQueryResult = Either<ReprocessQueryDomainErrors, QueryEntity>;

export type ReprocessQueryIO = EitherIO<ReprocessQueryDomainErrors, QueryEntity>;

export abstract class ReprocessQueryDomain {
  readonly reprocessQuery: (queryId: string) => ReprocessQueryIO;
}
