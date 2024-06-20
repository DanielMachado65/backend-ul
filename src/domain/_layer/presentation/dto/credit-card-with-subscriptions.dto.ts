import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreditCardMinimalDto } from '../../data/dto/credit-card-minimal.dto';
import { SubscriptionOutputDto } from './subscription-output.dto';

class CreditCardWithSubscriptions {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreditCardMinimalDto)
  creditCard: CreditCardMinimalDto;

  @ApiProperty({ type: [SubscriptionOutputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionOutputDto)
  subscriptions: ReadonlyArray<SubscriptionOutputDto>;
}

export class CreditCardsWithSubscriptionsOutputDto {
  @ApiProperty({ type: [CreditCardWithSubscriptions] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreditCardWithSubscriptions)
  creditCards: ReadonlyArray<CreditCardWithSubscriptions>;
}
