import { ApiProperty } from '@nestjs/swagger';
import {
  IsCreditCardExpirationDate,
  IsCreditCardHolderName,
  IsCreditCardNumber,
  IsCreditCardSecurityCode,
} from '../../../../infrastructure/decorators/credit-card.decorator';
import { Transform } from 'class-transformer';

export class CreditCardDto {
  @IsCreditCardNumber()
  @Transform(({ value }: { readonly value: string }) => value && value.split(' ').join(''))
  @ApiProperty({ example: '4111111111111111' })
  number: string;

  @IsCreditCardHolderName()
  @Transform(({ value }: { readonly value: string }) => value && value.trim().toUpperCase())
  @ApiProperty({ example: 'TESTE TESTE' })
  holderName: string;

  @IsCreditCardExpirationDate()
  @Transform(({ value }: { readonly value: string }) => value && value.split(' ').join(''))
  @ApiProperty({ example: '01/30' })
  expirationDate: string;

  @IsCreditCardSecurityCode()
  @Transform(({ value }: { readonly value: string }) => value && value.trim())
  @ApiProperty({ example: '123' })
  securityCode: string;
}
