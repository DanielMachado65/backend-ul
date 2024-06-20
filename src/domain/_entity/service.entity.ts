import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export enum ServicePriority {
  VERY_LOW = 1,
  LOW = 2,
  MEDIUM = 3,
  HIGH = 4,
  VERY_HIGH = 5,
}

export const allServicePriorities: ReadonlyArray<ServicePriority> = [
  ServicePriority.VERY_LOW,
  ServicePriority.LOW,
  ServicePriority.MEDIUM,
  ServicePriority.HIGH,
  ServicePriority.VERY_HIGH,
];

export abstract class ServiceSupplier {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  code: number;
}

export abstract class ServiceSwitching {
  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  supplier: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @EnumUtil.ApiProperty(ServicePriority)
  @IsEnum(ServicePriority)
  priority: ServicePriority;
}

export class ServiceEntity {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  createdAt: string;

  @ApiProperty()
  @IsBoolean()
  status: boolean;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  code: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsObject()
  @Type(() => ServiceSupplier)
  supplier: ServiceSupplier;

  @ApiProperty()
  @IsBoolean()
  hasAutoSwitching: boolean;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceSwitching)
  switchingServices: ReadonlyArray<ServiceSwitching>;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  minimumPrice: number;
}
