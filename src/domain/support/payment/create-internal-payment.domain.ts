import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { PaymentCreationOrigin, PaymentType } from 'src/domain/_entity/payment.entity';
import { CartDto } from 'src/domain/_layer/data/dto/cart.dto';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import {
  EmptyCartDomainError,
  NoPackageFoundDomainError,
  NoPriceTableFoundDomainError,
  NoQueryFoundDomainError,
  NoUserFoundDomainError,
  ProductUnavailableToUserDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';

export type PaymentDomainErrors =
  | EmptyCartDomainError
  | NoPackageFoundDomainError
  | NoPriceTableFoundDomainError
  | NoQueryFoundDomainError
  | NoUserFoundDomainError
  | ProductUnavailableToUserDomainError
  | UnknownDomainError;

export type PaymentIO = EitherIO<PaymentDomainErrors, PaymentDto>;

export type CreateInternalPaymentExtras = {
  readonly origin?: PaymentCreationOrigin;
};

export abstract class CreateInternalPaymentDomain {
  readonly call: (
    userId: string,
    cart: CartDto,
    paymentType: PaymentType,
    extras?: CreateInternalPaymentExtras,
  ) => PaymentIO;
}
