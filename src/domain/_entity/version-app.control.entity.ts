import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum DeviceTypeVersionAppControl {
  ANDROID = 'android',
  IOS = 'ios',
}

export class VersionAppControlEntity {
  @ApiProperty()
  @IsEnum(DeviceTypeVersionAppControl)
  deviceType: DeviceTypeVersionAppControl;

  @ApiProperty()
  @IsString()
  currentVersion: string;
}

export class VersionAppControlInputEntity {
  @ApiProperty()
  @IsString()
  storeVersion: string;

  @ApiProperty()
  @IsString()
  currentAppVersion: string;

  @ApiProperty()
  @IsString()
  operatingSystem: string;
}
