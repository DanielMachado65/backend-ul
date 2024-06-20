import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { PaymentEntity } from '../../_entity/payment.entity';
import { UnknownDomainError } from '../../_entity/result.error';
import { CartDto } from '../../_layer/data/dto/cart.dto';

export type PaymentWithCreditCardDomainErrors = UnknownDomainError;

export type PaymentWithCreditCardResult = Either<PaymentWithCreditCardDomainErrors, PaymentEntity>;

export type PaymentWithCreditCardIO = EitherIO<PaymentWithCreditCardDomainErrors, PaymentEntity>;

export abstract class PaymentWithCreditCardLegacyDomain {
  readonly paymentWithCreditCard: (
    userId: string,
    authToken: string,
    cardToken: string,
    cart: CartDto,
    reqParentId: string,
  ) => PaymentWithCreditCardIO;
}
