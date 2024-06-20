import { IsBoolean, IsInt, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export abstract class ConsumptionStatementEntity {
  @IsString()
  id: string;

  @IsNumber()
  @IsInt()
  @IsPositive()
  queryCode: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  tag?: string;

  @IsBoolean()
  isPaid: boolean;

  @IsNumber()
  @IsInt()
  @IsPositive()
  valueInCents: number;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  payDay?: string;

  @IsString()
  @IsNotEmpty()
  billingId: string;

  @IsString()
  @IsNotEmpty()
  queryId: string;
}
