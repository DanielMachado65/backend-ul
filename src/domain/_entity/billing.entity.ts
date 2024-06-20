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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export enum BillingType {
  PRE_PAID = 1,
  POST_PAID = 2,
}

export const billingTypes: ReadonlyArray<BillingType> = [BillingType.PRE_PAID, BillingType.POST_PAID];

export abstract class BillingDeadlineToPay {
  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  initDate: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  endDate: string;
}

export abstract class BillingInvoice {
  @ApiProperty()
  @IsString()
  invoiceId: string;

  @ApiProperty()
  @IsISO8601()
  insertDate: string;
}

export abstract class BillingPackage {
  @ApiProperty({ deprecated: true, description: 'This property is deprecated in favor of "purchasePriceInCents"' })
  @IsNumber()
  purchasePrice: number;

  @ApiProperty()
  @IsNumber()
  purchasePriceInCents: number;

  @ApiProperty({ deprecated: true, description: 'This property is deprecated in favor of "attributedValueInCents"' })
  @IsNumber()
  attributedValue: number;

  @ApiProperty()
  @IsNumber()
  attributedValueInCents: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsISO8601()
  accessionDate: string;

  @ApiProperty()
  @IsPositive()
  @IsInt()
  amount: number;

  @ApiProperty()
  @IsNumber()
  discountPercent: number;
}

export abstract class BillingSubscription {
  @ApiProperty()
  @IsString()
  subscriptionId: string;
}

export abstract class BillingOrderRoles {
  @ApiProperty()
  @IsBoolean()
  hasUsedCouponOnFirstOrder: boolean;

  @ApiProperty()
  @IsString()
  couponId: string;

  @ApiProperty()
  @IsString()
  couponCode: string;

  @ApiProperty()
  @IsBoolean()
  isPartnerCoupon: boolean;
}

export abstract class BillingEntity {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @EnumUtil.ApiProperty(BillingType)
  @IsEnum(BillingType)
  billingType: BillingType;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  accountFundsCents: number;

  @ApiProperty()
  @IsBoolean()
  activeAccount: boolean;

  @ApiProperty()
  @IsBoolean()
  isReliable: boolean;

  @ApiProperty()
  @IsObject()
  @Type(() => BillingDeadlineToPay)
  deadlineToPay: BillingDeadlineToPay;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  priceTableId: string;

  @ApiProperty()
  @IsArray()
  invoices: ReadonlyArray<BillingInvoice>;

  @ApiProperty()
  @IsArray()
  @Type(() => BillingPackage)
  packages: ReadonlyArray<BillingPackage>;

  @ApiProperty()
  @IsArray()
  @Type(() => BillingSubscription)
  subscriptions: ReadonlyArray<BillingSubscription>;

  @ApiProperty()
  @IsObject()
  @Type(() => BillingOrderRoles)
  orderRoles: BillingOrderRoles;
}
