import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { GetProviderDataQueueDto } from 'src/domain/_layer/data/dto/get-provider-data.dto';
import { ReprocessQueryInput } from 'src/domain/_layer/infrastructure/service/auto-reprocess.service';

export type ReprocessQueryQueueDomainErrors = UnknownDomainError;

export type ReprocessQueryStatus = 'SUCCESS' | 'PROCCESSING' | 'EXPIRED_TIME';
export type AutoReprocessInputDto = ReprocessQueryInput;
export type ProviderDataQueueDto = GetProviderDataQueueDto & { readonly status: ReprocessQueryStatus };

export type ReprocessQueryQueueIO = EitherIO<ReprocessQueryQueueDomainErrors, void>;
export type RequestToReprocessQueryIO = EitherIO<UnknownDomainError, void>;

export abstract class ReprocessQueryQueueDomain {
  saveLegacyQuery: (queryId: string, response: ProviderDataQueueDto) => ReprocessQueryQueueIO;
}
