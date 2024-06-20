import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ServiceLogReprocessing {
  @IsBoolean()
  isReprocessing: boolean;

  @IsNumber()
  @IsInt()
  @IsPositive()
  attemptsCount: number;

  @IsISO8601()
  @IsOptional()
  lastRetryAt?: string;

  @IsNumber()
  @IsInt()
  @IsPositive()
  originalServiceCode: number;
}

export abstract class ServiceLogEntity {
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  logId: string;

  @IsNumber()
  @IsInt()
  @IsPositive()
  serviceCode: number;

  @IsISO8601()
  @IsOptional()
  createdAt: string;

  @IsBoolean()
  status: boolean;

  @IsString()
  @IsNotEmpty()
  error: string;

  @IsObject()
  @IsOptional()
  @Type(() => ServiceLogReprocessing)
  reprocessing?: ServiceLogReprocessing;
}
