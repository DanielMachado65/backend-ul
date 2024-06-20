import { Type } from 'class-transformer';
import { CartDto } from './cart.dto';
import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrackPaymentInitPayloadDto {
  @ApiProperty()
  @Type(() => CartDto)
  @IsObject()
  cart: CartDto;
}
