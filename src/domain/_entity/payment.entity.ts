import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';
import { TransitionRule } from 'src/infrastructure/util/transition.util';

export class PaymentDebtsInstallment {
  @ApiProperty()
  @IsNumber()
  fee: number;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  numberOfInstallments: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  coupon: string; // ???

  @ApiProperty()
  @IsString()
  type: string; // ???

  @ApiProperty()
  @IsNumber()
  priceInCents: number;

  @ApiProperty()
  @IsNumber()
  monthlyFee: number;

  @ApiProperty()
  @IsNumber()
  priceWithInterestInCents: number;
}

export class PaymentDebtsItem {
  @ApiProperty()
  @IsString()
  protocol: string;

  @ApiProperty()
  @IsString()
  externalId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  amountInCents: number;

  @ApiProperty()
  @IsString()
  @IsISO8601()
  dueDate: string;

  @ApiProperty()
  @IsBoolean()
  required: boolean;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  distinct: ReadonlyArray<string>;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  dependsOn: ReadonlyArray<string>;
}

export class PaymentDebts {
  @ApiProperty()
  @Type(() => PaymentDebtsInstallment)
  installment: PaymentDebtsInstallment;

  @ApiProperty({ type: [PaymentDebtsItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDebtsItem)
  items: ReadonlyArray<PaymentDebtsItem>;
}

export class PaymentItem {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsNumber()
  totalValueInCents: number;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  unitValueInCents: number;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  queryId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  packageId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signatureId: string;
}

export class PaymentCreditCard {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsNumber()
  installments: number;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  installmentValueInCents: number;
}

export class PaymentBankingBillet {
  @ApiProperty()
  @IsString()
  barcode: string;

  @ApiProperty()
  @IsString()
  link: string;

  @ApiProperty()
  @IsISO8601()
  expireAt: string;
}

export class PaymentPix {
  @ApiProperty()
  @IsString()
  qrcode: string;

  @ApiProperty()
  @IsString()
  qrcodeText: string;
}

export class GatewayHistoryArcDetail {
  @ApiProperty()
  @IsString()
  referenceIn: string;

  @ApiProperty()
  @IsString()
  createdAt: string;
}

export class GatewayArcDetails {
  @ApiProperty()
  @IsObject()
  gatewayHistory: Record<string, GatewayHistoryArcDetail>;
}

export class GatewayDetails {
  @ApiProperty()
  @Type(() => GatewayHistoryArcDetail)
  @IsOptional()
  arc?: GatewayArcDetails | null;
}

export enum PaymentType {
  BANKING_BILLET = 'banking_billet',
  CREDIT_CARD = 'credit_card',
  PIX = 'pix',
}

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  PENDING = 'pending',
}

export enum PaymentCreationOrigin {
  WEBSITE = 'website',
  MOBILE = 'mobile',
  UNKNOWN = 'unknown',
}

export const paymentStatusTransitionRule: TransitionRule<PaymentStatus> = [
  { value: PaymentStatus.PENDING, allow: [PaymentStatus.PAID, PaymentStatus.UNPAID] },
  { value: PaymentStatus.PAID, allow: [] },
  { value: PaymentStatus.UNPAID, allow: [] },
];

export const allPaymentStatus: ReadonlyArray<PaymentStatus> = [
  PaymentStatus.PAID,
  PaymentStatus.UNPAID,
  PaymentStatus.PENDING,
];

export const allPaymentCreationOrigin: ReadonlyArray<PaymentCreationOrigin> = [
  PaymentCreationOrigin.WEBSITE,
  PaymentCreationOrigin.MOBILE,
  PaymentCreationOrigin.UNKNOWN,
];

export enum PaymentGatewayType {
  ARC = 'arc',
  GERENCIA_NET = 'gerencia-net',
  IUGU = 'iugu',
  ASAAS = 'asaas',
  MERCADO_PAGO = 'mercado-pago',
  UNKNOWN = 'unknown',
}

export class PaymentEntity {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @ApiProperty()
  @IsString()
  billingId: string;

  @ApiProperty()
  @Type(() => PaymentDebts)
  @IsOptional()
  debts?: PaymentDebts;

  @ApiProperty({ type: [PaymentItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItem)
  items: ReadonlyArray<PaymentItem>;

  @ApiProperty()
  @IsString()
  @IsOptional()
  chargeId?: string;

  @ApiProperty()
  @IsString()
  paymentExternalRef: string;

  @ApiProperty()
  @Type(() => GatewayDetails)
  gatewayDetails: GatewayDetails;

  @EnumUtil.ApiProperty(PaymentStatus)
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  totalPriceWithDiscountInCents: number;

  @ApiProperty({ deprecated: true })
  @IsNumber()
  @IsInt()
  @IsOptional()
  totalPriceInCents?: number;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  totalPaidInCents: number;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  realPriceInCents: number;

  @ApiProperty()
  paid: boolean;

  @EnumUtil.ApiProperty(PaymentType)
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty()
  @IsString()
  cnpj: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  paymentDate?: string;

  @ApiProperty()
  @Type(() => PaymentCreditCard)
  @IsOptional()
  creditCard?: PaymentCreditCard;

  @ApiProperty()
  @Type(() => PaymentBankingBillet)
  @IsOptional()
  bankingBillet?: PaymentBankingBillet;

  @ApiProperty()
  @Type(() => PaymentPix)
  @IsOptional()
  pix?: PaymentPix;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  couponId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nfeId?: string;

  @EnumUtil.ApiProperty(PaymentGatewayType)
  @IsEnum(PaymentGatewayType)
  @IsOptional()
  gateway: PaymentGatewayType;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  refMonth: number;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @Min(0)
  @Max(11)
  refYear: number;

  @EnumUtil.ApiProperty(PaymentCreationOrigin)
  @IsEnum(PaymentCreationOrigin)
  creationOrigin: PaymentCreationOrigin;
}
