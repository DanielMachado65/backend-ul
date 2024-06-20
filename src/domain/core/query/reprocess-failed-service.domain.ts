import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  NoQueryFoundDomainError,
  NoServiceFoundDomainError,
  NoServiceLogFoundDomainError,
  ProviderUnavailableDomainError,
  ServiceLogAlreadyReprocessingDomainError,
  TooManyServiceLogReprocessDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';
import { ServiceLogEntity } from '../../_entity/service-log.entity';

export type ReprocessFailedServiceDomainErrors =
  | UnknownDomainError
  | NoQueryFoundDomainError
  | NoServiceLogFoundDomainError
  | NoServiceFoundDomainError
  | TooManyServiceLogReprocessDomainError
  | ServiceLogAlreadyReprocessingDomainError
  | ProviderUnavailableDomainError;

export type ReprocessFailedServiceResult = Either<ReprocessFailedServiceDomainErrors, ServiceLogEntity>;

export type ReprocessFailedServiceIO = EitherIO<ReprocessFailedServiceDomainErrors, ServiceLogEntity>;

export abstract class ReprocessFailedServiceDomain {
  readonly reprocessFailedService: (queryId: string, serviceLogId: string) => ReprocessFailedServiceIO;
}
