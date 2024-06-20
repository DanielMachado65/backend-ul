import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreditCardInputDto {
  @ApiProperty()
  @IsString()
  creditCardId: string;
}
