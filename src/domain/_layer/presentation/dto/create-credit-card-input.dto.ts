import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreditCardDto } from '../../data/dto/credit-card.dto';

export class CreateCreditCardInputDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreditCardDto)
  creditCard: CreditCardDto;
}
