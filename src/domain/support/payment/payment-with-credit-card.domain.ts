import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { TokenEntity } from 'src/domain/_entity/token.entity';
import { PaymentCreationOrigin, PaymentEntity } from '../../_entity/payment.entity';
import { UnknownDomainError } from '../../_entity/result.error';
import { CartDto } from '../../_layer/data/dto/cart.dto';

export type PaymentWithCreditCardDomainErrors = UnknownDomainError;

export type PaymentWithCreditCardResult = Either<PaymentWithCreditCardDomainErrors, PaymentEntity>;

export type PaymentWithCreditCardIO = EitherIO<PaymentWithCreditCardDomainErrors, PaymentEntity>;

export type PaymentWithCreditCardExtras = {
  readonly origin?: PaymentCreationOrigin;
};

export abstract class PaymentWithCreditCardDomain {
  readonly paymentWithCreditCard: (
    userId: string,
    cardToken: TokenEntity,
    cart: CartDto,
    reqParentId: string,
    extras?: PaymentWithCreditCardExtras,
  ) => PaymentWithCreditCardIO;
}
