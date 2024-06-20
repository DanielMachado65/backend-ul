import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { PaymentGatewayType } from 'src/domain/_entity/payment.entity';
import { NoPaymentFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';

export type SyncWithExternalPaymentDomainErrors = UnknownDomainError | NoPaymentFoundDomainError;

export type SyncWithExternalPaymentIO = EitherIO<SyncWithExternalPaymentDomainErrors, PaymentDto>;

export abstract class SyncWithExternalPaymentDomain {
  abstract syncInternal(paymentId: string, reqParentId: string): SyncWithExternalPaymentIO;

  abstract syncWithExternalReference(
    externalReference: string,
    idempotence: string,
    gateway: PaymentGatewayType,
    reqParentId: string,
  ): SyncWithExternalPaymentIO;
}
