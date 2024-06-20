import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsCreditCardExpirationDate } from '../../../../infrastructure/decorators/credit-card.decorator';

export class CreditCardMinimalDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  lastFourDigits: string;

  @ApiProperty({ example: 'Current supported brands are: visa, master, amex, elo and hipercard' })
  @IsString()
  brandCard: string;

  @ApiProperty({ example: 'Current supported brands are: visa, master, amex, elo and hipercard' })
  @IsString()
  brandCardImg: string;

  @IsCreditCardExpirationDate()
  @Transform(({ value }: { readonly value: string }) => value && value.split(' ').join(''))
  @ApiProperty({ example: '01/30' })
  expirationDate: string;
}
