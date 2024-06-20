import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ClientType } from 'src/domain/_entity/client.entity';
import { QueryRepresentationWithPopUpEntity } from 'src/domain/_entity/query-representation.entity';
import {
  NoQueryFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';

export type GetAlreadyDoneQueryV2DomainErrors =
  | UnknownDomainError
  | NoQueryFoundDomainError
  | ProviderUnavailableDomainError;

export type GetAlreadyDoneQueryV2Result = Either<GetAlreadyDoneQueryV2DomainErrors, QueryRepresentationWithPopUpEntity>;

export type GetAlreadyDoneQueryV2IO = EitherIO<GetAlreadyDoneQueryV2DomainErrors, QueryRepresentationWithPopUpEntity>;

export abstract class GetAlreadyDoneQueryV2Domain {
  readonly getAlreadyDoneQuery: (queryId: string, clientType: ClientType) => GetAlreadyDoneQueryV2IO;
}
