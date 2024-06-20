import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { ReplacedServiceCodeto } from 'src/domain/_layer/data/dto/service.dto';

export type ReplaceFailedServicesDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type ReplaceFailedServicesResult = Either<ReplaceFailedServicesDomainErrors, void>;

export type ReplaceFailedServicesIO = EitherIO<ReplaceFailedServicesDomainErrors, void>;

export abstract class ReplaceFailedServicesDomain {
  readonly replace: (
    queryId: string,
    replacedServices: ReadonlyArray<ReplacedServiceCodeto>,
  ) => ReplaceFailedServicesIO;
}
