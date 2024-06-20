import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsISO8601, IsObject, IsString, ValidateNested } from 'class-validator';
import { LowerCase } from 'src/infrastructure/decorators/lowercase.decorator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  CHAT = 'chat',
  PUSH = 'push',
}

export const allNotificationChannels: ReadonlySet<NotificationChannel> = new Set([
  NotificationChannel.IN_APP,
  NotificationChannel.EMAIL,
  NotificationChannel.SMS,
  NotificationChannel.CHAT,
  NotificationChannel.PUSH,
]);

export enum NotificationProvider {
  FCM = 'fcm',
}

export enum NotificationStatusKind {
  ERROR = 'error',
  SENT = 'sent',
  WARNING = 'warning',
}

export enum NotificationActionKind {
  INTERNAL_NAVIGATE = 'internal_navigate',
  EXTERNAL_NAVIGATE = 'external_navigate',
  COPY = 'copy',
  NONE = 'none',
}

export type NotificationStatus =
  | {
      readonly kind: NotificationStatusKind.ERROR;
      readonly errroTag: string;
      readonly errorText: string;
    }
  | {
      readonly kind: NotificationStatusKind.SENT;
    }
  | {
      readonly kind: NotificationStatusKind.WARNING;
    };

export class NotificationStatusApiProperty {
  @EnumUtil.ApiProperty(NotificationStatusKind)
  @IsEnum(NotificationStatusKind)
  kind: NotificationStatusKind;

  @ApiPropertyOptional()
  @IsString()
  errorTag: string;

  @ApiPropertyOptional()
  @IsString()
  errorText: string;
}

export class NotificationOverridesData {
  @ApiProperty()
  @IsString()
  richContent: string;

  @ApiProperty({
    enum: [
      { kind: NotificationActionKind.INTERNAL_NAVIGATE, details: { id: '', params: {} } },
      { kind: NotificationActionKind.EXTERNAL_NAVIGATE, details: { url: '' } },
      { kind: NotificationActionKind.COPY, details: { displayText: '', value: '' } },
      { kind: NotificationActionKind.NONE, details: null },
    ],
    examples: [
      { kind: NotificationActionKind.INTERNAL_NAVIGATE, details: { id: 'all-credits', params: null } },
      {
        kind: NotificationActionKind.INTERNAL_NAVIGATE,
        details: { id: 'debts-and-fines', params: { carId: 'my-car-id' } },
      },
      { kind: NotificationActionKind.EXTERNAL_NAVIGATE, details: { url: 'https://www.olhonocarro.com.br/blog' } },
      { kind: NotificationActionKind.COPY, details: { displayText: 'Copiar cupom', value: 'XPTO' } },
      { kind: NotificationActionKind.NONE, details: null },
    ],
  })
  @IsObject()
  action: Record<string, unknown>;
}

export class NotificationOverrides {
  @ApiProperty()
  @ValidateNested()
  @Type(() => NotificationOverridesData)
  @IsObject()
  data: NotificationOverridesData;
}

export class NotificationEntity {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @LowerCase()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  content: string;

  @EnumUtil.ApiProperty(NotificationChannel)
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @EnumUtil.ApiProperty(NotificationProvider)
  @IsEnum(NotificationProvider)
  provider: NotificationProvider;

  @ApiProperty()
  @IsBoolean()
  wasSeen: boolean;

  @ApiProperty({ type: NotificationStatusApiProperty })
  @IsObject()
  status: NotificationStatus;

  @ApiProperty()
  @ValidateNested()
  @Type(() => NotificationOverrides)
  @IsObject()
  overrides: NotificationOverrides;

  @ApiProperty()
  @IsBoolean()
  deleted: boolean;

  @ApiProperty()
  @IsISO8601()
  expireAt: string;

  @ApiProperty()
  @IsISO8601()
  createdAt: string;

  @ApiProperty()
  @IsISO8601()
  updatedAt: string;
}
