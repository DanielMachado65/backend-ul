import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import { CartDto } from '../../data/dto/cart.dto';

export class PaymentWithPixInputDto {
  @ValidateNested()
  @Type(() => CartDto)
  @ApiProperty()
  @IsObject()
  cart: CartDto;
}
