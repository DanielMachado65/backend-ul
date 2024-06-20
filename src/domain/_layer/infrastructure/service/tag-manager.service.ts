import { PaymentType } from '../../../_entity/payment.entity';

export type PaymentEventItemDto = {
  readonly productId: string;
  readonly productName: string;
  readonly amount: number;
  readonly unitPriceInCents: number;
};

export type PaymentEventDto = {
  readonly paymentId: string;
  readonly paymentType: PaymentType;
  readonly couponName: string;
  readonly totalPaidInCents: number;
  readonly items: ReadonlyArray<PaymentEventItemDto>;
};

export type TagManagerEventsDto = PaymentEventDto;

export type TagManagerDto<Events = TagManagerEventsDto> = {
  readonly userId: string;
  readonly userEmail: string;
  readonly events: ReadonlyArray<Events>;
};

export abstract class TagManagerService {
  abstract dispatchPaymentSucceed(payload: TagManagerDto<PaymentEventDto>): Promise<boolean>;
}
