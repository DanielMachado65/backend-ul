import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class BalanceEntity {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  lastBalanceCents: number;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  currentBalanceCents: number;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  attributedValueCents: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  assignerId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  consumptionItemId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentId?: string;
}
