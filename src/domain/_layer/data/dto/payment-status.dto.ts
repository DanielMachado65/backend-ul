import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { EnumUtil } from '../../../../infrastructure/util/enum.util';
import { PaymentBankingBillet, PaymentPix, PaymentStatus, PaymentType } from '../../../_entity/payment.entity';

export class PaymentStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @EnumUtil.ApiProperty(PaymentStatus)
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @EnumUtil.ApiProperty(PaymentType)
  @IsEnum(PaymentType)
  type: PaymentType;

  @IsOptional()
  @IsObject()
  @Type(() => PaymentPix)
  pix: PaymentPix;

  @IsOptional()
  @IsObject()
  @Type(() => PaymentBankingBillet)
  bankingBillet: PaymentBankingBillet;
}
