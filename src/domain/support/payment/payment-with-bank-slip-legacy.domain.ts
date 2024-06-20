import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { PaymentEntity } from '../../_entity/payment.entity';
import { CantProcessPaymentDomainError, UnknownDomainError } from '../../_entity/result.error';
import { CartDto } from '../../_layer/data/dto/cart.dto';

export type PaymentWithBankSlipDomainErrors = UnknownDomainError | CantProcessPaymentDomainError;

export type PaymentWithBankSlipResult = Either<PaymentWithBankSlipDomainErrors, PaymentEntity>;

export type PaymentWithBankSlipIO = EitherIO<PaymentWithBankSlipDomainErrors, PaymentEntity>;

export abstract class PaymentWithBankSlipLegacyDomain {
  readonly paymentWithBankSlip: (
    userId: string,
    authToken: string,
    cart: CartDto,
    reqParentId: string,
  ) => PaymentWithBankSlipIO;
}
