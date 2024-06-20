import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryKeysEntity } from '../../_entity/query-keys.entity';
import { QueryEntity } from '../../_entity/query.entity';
import {
  InvalidKeysForProductDomainError,
  NoProductFoundDomainError,
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';

export type CreateQueryDomainErrors =
  | UnknownDomainError
  | NoUserFoundDomainError
  | NoProductFoundDomainError
  | InvalidKeysForProductDomainError
  | ProviderUnavailableDomainError;

export type CreateQueryResult = Either<CreateQueryDomainErrors, QueryEntity>;

export type CreateQueryIO = EitherIO<CreateQueryDomainErrors, QueryEntity>;

export abstract class CreateQueryDomain {
  readonly createQuery: (
    userId: string,
    queryCode: number,
    queryKeys: QueryKeysEntity,
    mayDuplicate: boolean,
  ) => CreateQueryIO;
}
