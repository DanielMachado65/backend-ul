import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export enum PlanStatus {
  ACTIVE = 'active',
  DEACTIVE = 'deactive',
}

export const planStatus: ReadonlySet<PlanStatus> = new Set([PlanStatus.ACTIVE, PlanStatus.DEACTIVE]);

export enum PlanTag {
  MONITORING = 'monitoramento',
  MY_CARS = 'meus_carros',
  MONTHLY_CREDITS = 'monthly_credits',
}

export const planTag: ReadonlySet<PlanTag> = new Set([PlanTag.MONITORING, PlanTag.MY_CARS]);

export enum PlanIntervalFrequency {
  WEEKS = 'weeks',
  MONTHS = 'months',
}

export const planIntervalFrequency: ReadonlySet<PlanIntervalFrequency> = new Set([
  PlanIntervalFrequency.WEEKS,
  PlanIntervalFrequency.MONTHS,
]);

export enum PlanPayableWith {
  ALL = 'all',
  CREDIT_CARD = 'credit_card',
  BANK_SLIP = 'bank_slip',
}

export enum PlanGateway {
  IUGU = 'iugu',
  MERCADO_PAGO = 'mercado_pago',
  ARC = 'arc',
}

export const planGateway: ReadonlySet<PlanGateway> = new Set([PlanGateway.IUGU, PlanGateway.MERCADO_PAGO]);

export class PlanEntity {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @EnumUtil.ApiPropertyOptional(PlanTag)
  @IsEnum(PlanTag)
  @IsOptional()
  tag?: PlanTag;

  @EnumUtil.ApiProperty(PlanStatus)
  @IsEnum(PlanStatus)
  status: PlanStatus;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  intervalValue: number;

  @EnumUtil.ApiProperty(PlanIntervalFrequency)
  @IsEnum(PlanIntervalFrequency)
  intervalFrequency: PlanIntervalFrequency;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  costInCents: number;

  @ApiProperty()
  @EnumUtil.ApiProperty(PlanPayableWith)
  @IsEnum(PlanPayableWith)
  payableWith: PlanPayableWith;

  @ApiProperty()
  @IsString()
  gatewayRef: string;

  @EnumUtil.ApiProperty(PlanGateway)
  @IsEnum(PlanGateway)
  gateway: PlanGateway;

  /** @deprecated */
  addCredits: boolean;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  deactivatedAt: string;

  @ApiProperty()
  @IsISO8601()
  createdAt: string;

  @ApiProperty()
  @IsISO8601()
  updatedAt: string;
}
