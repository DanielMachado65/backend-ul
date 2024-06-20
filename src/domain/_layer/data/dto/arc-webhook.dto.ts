import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsISO8601, IsString, ValidateNested } from 'class-validator';

export class MetaArcWebhookDto {
  @ApiProperty()
  @IsISO8601()
  @IsString()
  timestamp: string;
}

export abstract class ArcWebhookDto<Payload> {
  @ApiProperty()
  @IsString()
  event: string;

  @ApiProperty()
  abstract payload: Payload;

  @ApiProperty()
  @ValidateNested()
  __meta__: MetaArcWebhookDto;
}

export class PaymentPayloadArcDto {
  @IsString()
  payment_id: string;

  @IsString()
  customer_id: string;

  @IsString()
  tenant: string;

  @IsString()
  idempotence: string;
}

export class SubscriptionPayloadArcDto {
  @IsString()
  subscription_id: string;

  @IsString()
  customer_id: string;

  @IsString()
  tenant: string;

  @IsString()
  idempotence: string;
}

export class PaymentUpdatedArcWebhookDto extends ArcWebhookDto<PaymentPayloadArcDto> {
  @ValidateNested()
  @Type(() => PaymentPayloadArcDto)
  override payload: PaymentPayloadArcDto;
}

export class SubscriptionUpdatedArcWebhookDto extends ArcWebhookDto<SubscriptionPayloadArcDto> {
  @ValidateNested()
  @Type(() => SubscriptionPayloadArcDto)
  override payload: SubscriptionPayloadArcDto;
}
