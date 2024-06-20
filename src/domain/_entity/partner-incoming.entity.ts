import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PartnerIncomingEntity {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  paymentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  couponId: string;

  @ApiProperty()
  @IsString()
  couponCode: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  incomingRefValueCents: number;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  createdAt: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  updatedAt: string;
}
