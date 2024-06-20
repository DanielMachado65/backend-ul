import { IsEnum, IsISO8601, IsNumber, IsString } from 'class-validator';
import { SubscriptionGateway } from 'src/domain/_entity/subscription.entity';
import { CreditCardMinimalDto } from './credit-card-minimal.dto';

export enum ExternalSubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DUED = 'dued',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
  TERMINATED = 'terminated',
}

export enum ExternalSubscriptionRecurringCycle {
  YEARLY = 'yearly',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  HOURLY = 'hourly',
}

export class ExternalSubscriptionDto {
  @IsString()
  ref: string;

  @IsString()
  idempotence: string;

  @IsEnum(ExternalSubscriptionStatus)
  status: ExternalSubscriptionStatus;

  @IsString()
  recurringCycle: ExternalSubscriptionRecurringCycle;

  @IsNumber()
  recurringValueInCents: number;

  @IsNumber()
  daysBeforeExpire: number;

  @IsString()
  chargeAt: string;

  @IsString()
  dueAt: string;

  @IsISO8601()
  expiresAt: string;

  @IsString()
  creditCard: CreditCardMinimalDto;

  @IsString()
  creditCardRef: string;

  @IsString()
  customerRef: string;

  @IsString()
  strategyRef: string;

  @IsEnum(SubscriptionGateway)
  gateway: SubscriptionGateway;

  @IsString()
  createdAt: string;
}
