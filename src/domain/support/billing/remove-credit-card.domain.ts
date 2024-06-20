import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { CreditCardMinimalDto } from 'src/domain/_layer/data/dto/credit-card-minimal.dto';

export type RemoveCreditCardDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type RemoveCreditCardResult = Either<RemoveCreditCardDomainErrors, CreditCardMinimalDto>;

export type RemoveCreditCardIO = EitherIO<RemoveCreditCardDomainErrors, CreditCardMinimalDto>;

export abstract class RemoveCreditCardDomain {
  abstract remove(userId: string, creditCardId: string): RemoveCreditCardIO;
}
