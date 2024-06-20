import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { ClientType } from 'aws-sdk/clients/ssooidc';
import { QueryKeysEntity } from 'src/domain/_entity/query-keys.entity';
import { QueryRepresentationWithPopUpEntity } from 'src/domain/_entity/query-representation.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';

export type RequestCreditQueryErros = UnknownDomainError;

export type RequestCreditQueryIO = EitherIO<RequestCreditQueryErros, QueryRepresentationWithPopUpEntity>;

export type RequestCreditQueryInput = {
  readonly token: string;
  readonly userId: string;
  readonly queryCode: number;
  readonly keys: QueryKeysEntity;
  readonly clientType: ClientType;
  readonly mayDuplicate: boolean;
};

export abstract class RequestCreditQuerySyncDomain {
  abstract request(input: RequestCreditQueryInput): RequestCreditQueryIO;
}
