import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { IsCPF } from 'src/infrastructure/decorators';

export enum IndicatedCoupon {
  INDICATED = 'INDICADO',
}

export class IndicatedDto {
  @ApiProperty()
  @IsString()
  readonly id: string;

  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsCPF()
  readonly cpf: string;

  @ApiProperty()
  @IsISO8601()
  readonly createdAt: string;

  @ApiProperty()
  @IsISO8601()
  readonly updatedAt: string;

  @ApiProperty()
  @IsString()
  readonly participantId: string;

  @ApiProperty()
  @IsEnum(IndicatedCoupon)
  @IsOptional()
  readonly coupon?: IndicatedCoupon;
}
