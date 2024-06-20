import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CouponInfo {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  couponCode: string;
}
