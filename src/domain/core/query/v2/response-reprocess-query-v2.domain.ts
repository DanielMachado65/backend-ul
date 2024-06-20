import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { ReprocessInfosDto } from 'src/domain/core/query/v2/response-query.domain';

export type ResponseReprocessQueryV2Errors = UnknownDomainError | ProviderUnavailableDomainError;

export type ResponseReprocessQueryV2IO = EitherIO<ResponseReprocessQueryV2Errors, void>;

export class ResponseReprocessQueryV2Domain {
  response: (queryResponse: QueryResponseDto, reprocessInfos: ReprocessInfosDto) => ResponseReprocessQueryV2IO;
}
