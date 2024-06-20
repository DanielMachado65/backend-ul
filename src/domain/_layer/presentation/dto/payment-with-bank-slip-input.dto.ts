import { ApiProperty } from '@nestjs/swagger';
import { IsObject, ValidateNested } from 'class-validator';
import { CartDto } from '../../data/dto/cart.dto';
import { Type } from 'class-transformer';

export class PaymentWithBankSlipInputDto {
  @ValidateNested()
  @Type(() => CartDto)
  @ApiProperty()
  @IsObject()
  cart: CartDto;
}
