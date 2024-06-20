import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsISO8601, IsInt, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { PlanEntity, PlanTag } from 'src/domain/_entity/plan.entity';
import { SubscriptionStatus } from 'src/domain/_entity/subscription.entity';
import { EnumUtil } from 'src/infrastructure/util/enum.util';
import { PlanDto } from '../../data/dto/plan.dto';

export class SubscriptionRelatedDataDto {
  @ApiProperty({ nullable: true })
  @IsString()
  plate: string;
}

export class SubscriptionOutputDto {
  @ApiProperty({ type: SubscriptionRelatedDataDto })
  @Type(() => SubscriptionRelatedDataDto)
  relatedData: SubscriptionRelatedDataDto | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  creditCardId: string | null;

  @ApiProperty()
  @IsString()
  @Length(4)
  creditCardLast4: string;

  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @EnumUtil.ApiProperty(SubscriptionStatus)
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  @EnumUtil.ApiPropertyOptional(PlanTag)
  @IsEnum(PlanTag)
  @IsOptional()
  planTag: PlanTag;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  lastChargeInCents: number;

  @ApiProperty()
  @IsISO8601()
  deactivatedAt: string;

  @ApiProperty()
  @IsISO8601()
  nextChargeAt: string;

  @ApiProperty()
  @IsISO8601()
  expiresAt: string;

  @ApiProperty()
  @IsISO8601()
  createdAt: string;

  @ApiProperty()
  @IsISO8601()
  updatedAt: string;

  @Type(() => PlanEntity)
  @ApiProperty({ type: PlanEntity })
  plan: PlanDto;
}
