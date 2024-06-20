import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { PaymentCreationOrigin, PaymentEntity } from '../../_entity/payment.entity';
import { UnknownDomainError } from '../../_entity/result.error';
import { CartDto } from '../../_layer/data/dto/cart.dto';

export type PaymentWithPixDomainErrors = UnknownDomainError;

export type PaymentWithPixResult = Either<PaymentWithPixDomainErrors, PaymentEntity>;

export type PaymentWithPixIO = EitherIO<PaymentWithPixDomainErrors, PaymentEntity>;

export type PaymentWithPixExtras = {
  readonly origin?: PaymentCreationOrigin;
};

export abstract class PaymentWithPixDomain {
  readonly paymentWithPix: (
    userId: string,
    cart: CartDto,
    reqParentId: string,
    extras?: PaymentWithPixExtras,
  ) => PaymentWithPixIO;
}
