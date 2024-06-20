import { Either } from '@alissonfpmorais/minimal_fp';
import { PaymentBankingBillet, PaymentPix, PaymentStatus } from '../../../_entity/payment.entity';

export enum PaymentError {
  UNKNOWN_PAYMENT_ERROR = 'Problemas no processamento do pagamento. Por favor, tente novamente!',
}

type PaymentId = string;

export type PaymentResponseDto = Either<PaymentError, PaymentId>;

export class CurrentGatewayDto {
  gateway: string;
  referenceIn: string;
}

export class ExternalPaymentStateDto {
  status: PaymentStatus;
  bankSlipResource: PaymentBankingBillet | null;
  creditCardResource: Record<string, unknown> | null;
  pixResource: PaymentPix | null;
  details: {
    readonly currentGateway: CurrentGatewayDto | null;
  };
  paidAt: string | null;
}
