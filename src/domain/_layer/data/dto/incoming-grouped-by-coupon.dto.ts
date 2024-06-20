import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';

export class IncomingGroupedByCouponDto {
  @ApiProperty()
  @IsString()
  couponCode: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  amountToPayCents: number;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  amountUsed: number;
}
