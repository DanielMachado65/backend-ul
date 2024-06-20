import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryNotExistsError, QueryOwnerInvalid, UnknownDomainError } from 'src/domain/_entity/result.error';

export type ResquestAutoReprocessQueryError = UnknownDomainError | QueryNotExistsError | QueryOwnerInvalid;

export type ResquestAutoReprocessQueryResult = Either<ResquestAutoReprocessQueryError, void>;
export type ResquestAutoReprocessQueryIO = EitherIO<ResquestAutoReprocessQueryError, void>;

export abstract class ResquestAutoReprocessQueryDomain {
  requestByQueryId: (userId: string, queryId: string) => ResquestAutoReprocessQueryIO;
}
