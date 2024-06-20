import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsObject,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PlanIntervalFrequency, PlanStatus } from 'src/domain/_entity/plan.entity';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export class PlanOutputDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @EnumUtil.ApiProperty(PlanStatus)
  @IsEnum(PlanStatus)
  status: PlanStatus;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  intervalValue: number;

  @EnumUtil.ApiProperty(PlanIntervalFrequency)
  @IsEnum(PlanIntervalFrequency)
  intervalFrequency: PlanIntervalFrequency;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  costInCents: number;

  @ApiProperty()
  @IsISO8601()
  createdAt: string;

  @ApiProperty()
  @IsISO8601()
  updatedAt: string;
}

export class PlanAvailabilityOutputDto {
  @IsBoolean()
  @ApiProperty()
  isFreePlanAvailableToBeCreated: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => PlanOutputDto)
  @ApiProperty()
  plan: PlanOutputDto;
}
