import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreditCardDto } from '../../data/dto/credit-card.dto';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

enum PaymentIntention {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
}

export class CreateCreditCardTokenInputDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreditCardDto)
  creditCard: CreditCardDto;

  @EnumUtil.ApiPropertyOptional(PaymentIntention)
  @IsEnum(PaymentIntention)
  @IsOptional()
  @Transform(({ value }: { readonly value?: PaymentIntention | null }) => value || PaymentIntention.ONE_TIME)
  paymentIntention: PaymentIntention = PaymentIntention.ONE_TIME;
}
