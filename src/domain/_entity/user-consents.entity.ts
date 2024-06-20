import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsString } from 'class-validator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export enum ConsentType {
  NEWS = 'news',
  PAYMENT_READ = 'payment:read',
}

export enum ChannelType {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  ZAPAY = 'zapay',
}

export abstract class UserConsents {
  @IsString()
  @EnumUtil.ApiProperty(ChannelType)
  channelType: ChannelType;

  @IsString()
  @EnumUtil.ApiProperty(ConsentType)
  consentType: ConsentType;

  @IsBoolean()
  @ApiProperty()
  hasGivenConsent: boolean;
}

export abstract class CompleteUserConsent {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  channelType: string;

  @IsString()
  @ApiProperty()
  consentType: string;

  @IsBoolean()
  @ApiProperty()
  hasGivenConsent: boolean;

  @IsBoolean()
  @ApiProperty()
  display: boolean;

  @IsString()
  @ApiProperty()
  consentTypeLabel?: string;

  @IsString()
  @IsISO8601()
  @ApiProperty()
  createdAt: string;

  @IsString()
  @IsISO8601()
  @ApiProperty()
  updatedAt: string;
}
