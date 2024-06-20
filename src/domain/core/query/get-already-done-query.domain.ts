import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryRepresentationWithPopUpEntity } from '../../_entity/query-representation.entity';
import {
  NoQueryFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';
import { ClientType } from '../../_entity/client.entity';

export type GetAlreadyDoneQueryDomainErrors =
  | UnknownDomainError
  | NoQueryFoundDomainError
  | ProviderUnavailableDomainError;

export type GetAlreadyDoneQueryResult = Either<GetAlreadyDoneQueryDomainErrors, QueryRepresentationWithPopUpEntity>;

export type GetAlreadyDoneQueryIO = EitherIO<GetAlreadyDoneQueryDomainErrors, QueryRepresentationWithPopUpEntity>;

export abstract class GetAlreadyDoneQueryDomain {
  readonly getAlreadyDoneQuery: (queryId: string, clientType: ClientType) => GetAlreadyDoneQueryIO;
}
