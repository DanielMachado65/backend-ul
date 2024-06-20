import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from '../../_entity/result.error';
import { TokenEntity } from '../../_entity/token.entity';
import { CreditCardDto } from '../../_layer/data/dto/credit-card.dto';

export type CreateCreditCardTokenDomainErrors = ProviderUnavailableDomainError;

export type CreateCreditCardTokenResult = Either<CreateCreditCardTokenDomainErrors, TokenEntity>;

export type CreateCreditCardTokenIO = EitherIO<CreateCreditCardTokenDomainErrors, TokenEntity>;

export abstract class CreateCreditCardTokenDomain {
  readonly createCreditCardToken: (
    creditCard: CreditCardDto,
    userId: string,
    reqParentId: string,
  ) => CreateCreditCardTokenIO;
}
