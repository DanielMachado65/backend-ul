import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { CreditCardMinimalDto } from 'src/domain/_layer/data/dto/credit-card-minimal.dto';
import { CreditCardDto } from 'src/domain/_layer/data/dto/credit-card.dto';

export type AddCreditCardDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type AddCreditCardResult = Either<AddCreditCardDomainErrors, CreditCardMinimalDto>;

export type AddCreditCardIO = EitherIO<AddCreditCardDomainErrors, CreditCardMinimalDto>;

export abstract class AddCreditCardDomain {
  abstract addCreditCard(userId: string, creditCard: CreditCardDto): AddCreditCardIO;
}
