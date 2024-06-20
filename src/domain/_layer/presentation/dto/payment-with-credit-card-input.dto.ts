import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { CartDto } from '../../data/dto/cart.dto';
import { Type } from 'class-transformer';

export class PaymentWithCreditCardInputDto {
  @ValidateNested()
  @Type(() => CartDto)
  @ApiProperty()
  @IsObject()
  cart: CartDto;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token: string;
}
