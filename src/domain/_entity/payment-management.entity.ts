import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';

export type PaymentSplittingAbsoluteType = 'absolute';

export type PaymentSplittingPercentType = 'percent';

export enum PaymentSplittingType {
  ABSOLUTE = 'absolute',
  PERCENT = 'percent',
}

export const allPaymentSplittingTypes: ReadonlyArray<PaymentSplittingType> = [
  PaymentSplittingType.ABSOLUTE,
  PaymentSplittingType.PERCENT,
];

export enum PaymentFillingOrder {
  RANDOM = 'random',
  SEQUENTIAL = 'sequential',
}

export const allPaymentFillingOrder: ReadonlyArray<PaymentFillingOrder> = [
  PaymentFillingOrder.RANDOM,
  PaymentFillingOrder.SEQUENTIAL,
];

export class PaymentSplittingAbsoluteRule {
  @ApiProperty()
  @IsString()
  cnpj: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  maxValueCents: number;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  fillOrder: number;
}

export class PaymentSplittingPercentRule {
  @ApiProperty()
  @IsString()
  cnpj: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  percent: number;
}

export type PaymentSplittingRule = PaymentSplittingAbsoluteRule | PaymentSplittingPercentRule;

export type PaymentManagementEntity =
  | {
      readonly id: string;
      readonly splittingType: PaymentSplittingAbsoluteType;
      readonly fillingOrder: PaymentFillingOrder;
      readonly rules: ReadonlyArray<PaymentSplittingAbsoluteRule>;
      readonly createdAt: string;
    }
  | {
      readonly id: string;
      readonly splittingType: PaymentSplittingPercentType;
      readonly rules: ReadonlyArray<PaymentSplittingPercentRule>;
      readonly createdAt: string;
    };
