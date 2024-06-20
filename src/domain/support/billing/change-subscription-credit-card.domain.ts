import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { SubscriptionOutputDto } from 'src/domain/_layer/presentation/dto/subscription-output.dto';

export type ChangeSubscriptionCreditCardDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type ChangeSubscriptionCreditCardResult = Either<
  ChangeSubscriptionCreditCardDomainErrors,
  SubscriptionOutputDto
>;

export type ChangeSubscriptionCreditCardIO = EitherIO<ChangeSubscriptionCreditCardDomainErrors, SubscriptionOutputDto>;

export abstract class ChangeSubscriptionCreditCardDomain {
  abstract changeBySubscriptionId(
    subscriptionId: string,
    creditCardId: string,
    userId: string,
  ): ChangeSubscriptionCreditCardIO;
}
