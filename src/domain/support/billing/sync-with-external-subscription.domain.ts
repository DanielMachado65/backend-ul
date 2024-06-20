import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';

export type SyncWithExternalSubscriptionDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type SyncWithExternalSubscriptionResult = Either<SyncWithExternalSubscriptionDomainErrors, SubscriptionDto>;

export type SyncWithExternalSubscriptionIO = EitherIO<SyncWithExternalSubscriptionDomainErrors, SubscriptionDto>;

export abstract class SyncWithExternalSubscriptionDomain {
  abstract syncWithExternalReference(externalReference: string, idempotence: string): SyncWithExternalSubscriptionIO;
}
