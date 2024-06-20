import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsISO8601, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';
import { NotificationChannel } from './notification.entity';

export enum MyCarProductStatusEnum {
  ACTIVE = 'active',
  DEACTIVE = 'deactive',
  EXCLUDING = 'excluding',
  EXCLUDED = 'excluded',
}

export enum MyCarProductTypeEnum {
  FREEMIUM = 'freemium',
  PREMIUM = 'premium',
}

export class RevisionConfig {
  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({ enum: NotificationChannel, enumName: 'NotificationChannel', isArray: true })
  @IsEnum(NotificationChannel, { each: true })
  notificationChannels: ReadonlyArray<NotificationChannel>;

  @IsBoolean()
  @ApiProperty()
  mileageKm: number;

  @IsBoolean()
  @ApiProperty()
  mileageKmMonthly: number;

  @IsBoolean()
  @ApiProperty()
  shouldNotify7DaysBefore: boolean;

  @IsBoolean()
  @ApiProperty()
  shouldNotify15DaysBefore: boolean;

  @IsBoolean()
  @ApiProperty()
  shouldNotify30DaysBefore: boolean;
}

export class OnQueryConfig {
  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({ enum: NotificationChannel, enumName: 'NotificationChannel', isArray: true })
  @IsEnum(NotificationChannel, { each: true })
  notificationChannels: ReadonlyArray<NotificationChannel>;
}

export class PriceFIPEConfig {
  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({ enum: NotificationChannel, enumName: 'NotificationChannel', isArray: true })
  @IsEnum(NotificationChannel, { each: true })
  notificationChannels: ReadonlyArray<NotificationChannel>;
}

export class FineConfig {
  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({ enum: NotificationChannel, enumName: 'NotificationChannel', isArray: true })
  @IsEnum(NotificationChannel, { each: true })
  notificationChannels: ReadonlyArray<NotificationChannel>;
}

export class MyCarKeys {
  @ApiProperty()
  @IsString()
  plate: string;

  @ApiProperty()
  @IsString()
  chassis: string;

  @ApiProperty()
  @IsString()
  brand: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty()
  @IsString()
  brandModelCode: string;

  @ApiProperty()
  @IsString()
  fipeId: string;

  @ApiProperty()
  @IsString()
  fipeName: string;

  @ApiProperty()
  @IsString()
  versionId: string;

  @ApiProperty()
  @IsNumber()
  modelYear: number;

  @ApiProperty()
  @IsString()
  engineNumber: string;

  @ApiProperty()
  @IsString()
  engineCapacity: string;

  @ApiProperty()
  @IsString()
  zipCode: string;
}

export class MyCarProductEntity {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  billingId: string;

  @IsString()
  @ApiProperty()
  subscriptionId: string;

  @IsEnum(MyCarProductTypeEnum)
  @EnumUtil.ApiProperty(MyCarProductTypeEnum)
  type: MyCarProductTypeEnum;

  @IsEnum(MyCarProductStatusEnum)
  @EnumUtil.ApiProperty(MyCarProductStatusEnum)
  status: MyCarProductStatusEnum;

  @IsISO8601()
  @ApiProperty()
  expiresAt: string;

  @IsISO8601()
  @ApiProperty()
  deactivatedAt: string;

  @IsISO8601()
  @ApiProperty()
  deletedAt: string;

  @Type(() => RevisionConfig)
  @IsOptional()
  @ApiPropertyOptional()
  revisionConfig: RevisionConfig | null;

  @Type(() => OnQueryConfig)
  @IsOptional()
  @ApiPropertyOptional()
  onQueryConfig: OnQueryConfig | null;

  @Type(() => PriceFIPEConfig)
  @IsOptional()
  @ApiPropertyOptional()
  priceFIPEConfig: PriceFIPEConfig | null;

  @Type(() => FineConfig)
  @IsOptional()
  @ApiPropertyOptional()
  fineConfig: FineConfig | null;

  @Type(() => MyCarKeys)
  @ValidateNested()
  @ApiProperty()
  keys: MyCarKeys;

  @IsISO8601()
  @ApiProperty()
  createdAt: string;

  @IsISO8601()
  @ApiProperty()
  updatedAt: string;
}
