import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum InvoiceStatus {
  OPENED = 'Aberta',
  PAID = 'Pago',
  PARTIALLY_PAID = 'Parcialmente pago',
  REFUNDED = 'Reembolsada',
  OVERDUE = 'Atrasada',
  IN_PROTEST = 'Em protesto',
  CHARGEBACK = 'Chargeback',
  IN_ANALYSIS = 'Em analise',
  CANCELLED = 'Cancelada',
}

export const allInvoiceStatus: ReadonlyArray<InvoiceStatus> = [
  InvoiceStatus.OPENED,
  InvoiceStatus.PAID,
  InvoiceStatus.PARTIALLY_PAID,
  InvoiceStatus.REFUNDED,
  InvoiceStatus.OVERDUE,
  InvoiceStatus.IN_PROTEST,
  InvoiceStatus.CHARGEBACK,
  InvoiceStatus.IN_ANALYSIS,
  InvoiceStatus.CANCELLED,
];

export abstract class InvoiceNotification {
  @IsNumber()
  @IsInt()
  sentEmails: number;

  @IsBoolean()
  hasBeenNotified: boolean;

  @IsISO8601()
  @IsOptional()
  lastNotificationDate?: string;
}

export abstract class InvoiceAccumulatedInvoices {
  @IsString()
  description: string;

  @IsNumber()
  @IsInt()
  totalValueCents: number;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  refInvoiceId?: string;
}

export abstract class InvoiceDiscount {
  @IsString()
  motive: string;

  @IsString()
  userId: string;

  @IsISO8601()
  createdAt: string;

  @IsNumber()
  @IsInt()
  valueCents: number;
}

export abstract class InvoiceEntity {
  @IsString()
  id: string;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  initialDate: string;

  @IsISO8601()
  @IsOptional()
  expirationDate: string;

  @IsEnum(InvoiceStatus)
  status: string;

  @IsNumber()
  @IsInt()
  valueCents: number;

  @IsISO8601()
  @IsOptional()
  paymentDate: string;

  @IsNumber()
  @IsInt()
  refYear: number;

  @IsNumber()
  @IsInt()
  refMonth: number;

  @IsString()
  @IsNotEmpty()
  billingId?: string;

  @IsString()
  @IsNotEmpty()
  paymentId?: string;

  @IsString()
  @IsNotEmpty()
  invoiceNotification: InvoiceNotification;

  @IsArray()
  accumulatedInvoices: ReadonlyArray<InvoiceAccumulatedInvoices>;

  @IsArray()
  discounts: ReadonlyArray<InvoiceDiscount>;

  @IsArray()
  consumptionStatementIds: ReadonlyArray<string>;
}
