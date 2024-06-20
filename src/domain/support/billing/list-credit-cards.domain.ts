import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { CreditCardsWithSubscriptionsOutputDto } from 'src/domain/_layer/presentation/dto/credit-card-with-subscriptions.dto';

export type ListCreditCardsDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type ListCreditCardsResult = Either<ListCreditCardsDomainErrors, CreditCardsWithSubscriptionsOutputDto>;

export type ListCreditCardsIO = EitherIO<ListCreditCardsDomainErrors, CreditCardsWithSubscriptionsOutputDto>;

export abstract class ListCreditCardsDomain {
  abstract listAll(userId: string): ListCreditCardsIO;
}
