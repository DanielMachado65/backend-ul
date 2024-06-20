import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryEntity } from '../../_entity/query.entity';
import {
  NoQueryFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';

export type GetQueryDomainErrors = UnknownDomainError | NoQueryFoundDomainError | ProviderUnavailableDomainError;

export type GetQueryResult = Either<GetQueryDomainErrors, QueryEntity>;

export type GetQueryIO = EitherIO<GetQueryDomainErrors, QueryEntity>;

export abstract class GetQueryDomain {
  readonly getQuery: (queryId: string) => GetQueryIO;
}
