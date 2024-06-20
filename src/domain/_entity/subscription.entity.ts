import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsISO8601, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';
import { PlanPayableWith, PlanTag } from './plan.entity';

export enum SubscriptionGateway {
  IUGU = 'iugu',
  MERCADO_PAGO = 'mercado_pago',
  ARC = 'arc',
}

export const subscriptionGateway: ReadonlySet<SubscriptionGateway> = new Set([
  SubscriptionGateway.IUGU,
  SubscriptionGateway.MERCADO_PAGO,
  SubscriptionGateway.ARC,
]);

export enum SubscriptionStatus {
  CANCELLING = 'CANCELANDO',
  CANCELED = 'CANCELADO',
  ACTIVE = 'ATIVO',
  INACTIVE = 'INACTIVE',
  PENDING = 'AGUARDANDO',
}

export const subscriptionStatus: ReadonlySet<SubscriptionStatus> = new Set([
  SubscriptionStatus.CANCELLING,
  SubscriptionStatus.CANCELED,
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.INACTIVE,
  SubscriptionStatus.PENDING,
]);

export class SubscriptionEntity {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  planId: string;

  @ApiProperty()
  @IsString()
  billingId: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  paymentIds: ReadonlyArray<string>;

  @EnumUtil.ApiProperty(SubscriptionGateway)
  @IsEnum(SubscriptionGateway)
  gateway: SubscriptionGateway;

  @ApiProperty()
  @IsString()
  gatewayRef: string;

  @EnumUtil.ApiProperty(PlanPayableWith)
  @IsEnum(PlanPayableWith)
  paymentMethod: PlanPayableWith;

  @ApiProperty()
  ignoreBillingNotification: boolean;

  @EnumUtil.ApiProperty(SubscriptionStatus)
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  @EnumUtil.ApiPropertyOptional(PlanTag)
  @IsEnum(PlanTag)
  @IsOptional()
  planTag: PlanTag;

  @ApiProperty()
  @IsISO8601()
  deactivatedAt: string;

  @ApiProperty()
  @IsISO8601()
  nextChargeAt: string;

  @ApiProperty()
  @IsISO8601()
  expiresAt: string;

  @ApiProperty()
  @IsISO8601()
  createdAt: string;

  @ApiProperty()
  @IsISO8601()
  updatedAt: string;
}
