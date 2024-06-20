import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryKeysEntity } from '../../../_entity/query-keys.entity';
import { QueryEntity } from '../../../_entity/query.entity';
import {
  InvalidKeysForProductDomainError,
  NoProductFoundDomainError,
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from '../../../_entity/result.error';

export type CreateQueryV2DomainErrors =
  | UnknownDomainError
  | NoUserFoundDomainError
  | NoProductFoundDomainError
  | InvalidKeysForProductDomainError
  | ProviderUnavailableDomainError;

export type CreateQueryV2Result = Either<CreateQueryV2DomainErrors, QueryEntity>;

export type CreateQueryV2IO = EitherIO<CreateQueryV2DomainErrors, QueryEntity>;

export abstract class CreateQueryV2Domain {
  readonly createQuery: (
    userId: string,
    queryCode: number,
    queryKeys: QueryKeysEntity,
    mayDuplicate: boolean,
  ) => CreateQueryV2IO;
}
