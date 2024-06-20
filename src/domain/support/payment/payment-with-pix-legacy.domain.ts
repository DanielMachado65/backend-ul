import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { PaymentEntity } from '../../_entity/payment.entity';
import { UnknownDomainError } from '../../_entity/result.error';
import { CartDto } from '../../_layer/data/dto/cart.dto';

export type PaymentWithPixDomainErrors = UnknownDomainError;

export type PaymentWithPixResult = Either<PaymentWithPixDomainErrors, PaymentEntity>;

export type PaymentWithPixIO = EitherIO<PaymentWithPixDomainErrors, PaymentEntity>;

export abstract class PaymentWithPixLegacyDomain {
  readonly paymentWithPix: (userId: string, authToken: string, cart: CartDto, reqParentId: string) => PaymentWithPixIO;
}
