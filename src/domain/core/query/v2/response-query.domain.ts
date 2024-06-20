import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  DataNotFoundDomainError,
  ProviderUnavailableDomainError,
  QueryRequestFailError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { ReprocessQueryStatus } from '../reprocess-query-queue.domain';

export type ResponseQueryDomainErrors =
  | UnknownDomainError
  | DataNotFoundDomainError
  | ProviderUnavailableDomainError
  | QueryRequestFailError;

export type ResponseQueryResult = Either<ResponseQueryDomainErrors, void>;
export type ResponseQueryIO = EitherIO<ResponseQueryDomainErrors, void>;

export type ReprocessInfosDto = {
  readonly status?: ReprocessQueryStatus;
};

export abstract class ResponseQueryDomain {
  readonly responseQuery: (queryResponse: QueryResponseDto) => ResponseQueryIO;
}
