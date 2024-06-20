import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';

export type CancelUserSubscriptionDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type CancelUserSubscriptionResult = Either<CancelUserSubscriptionDomainErrors, SubscriptionDto>;

export type CancelUserSubscriptionIO = EitherIO<CancelUserSubscriptionDomainErrors, SubscriptionDto>;

export abstract class CancelUserSubscriptionDomain {
  abstract cancelById(subscriptionId: string, userId: string): CancelUserSubscriptionIO;
}
