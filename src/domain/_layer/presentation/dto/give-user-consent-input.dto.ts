import { IsBoolean, IsString } from 'class-validator';
import { ChannelType, ConsentType } from 'src/domain/_entity/user-consents.entity';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export class GiveUserConsentInputDto {
  consentId: string;

  @IsString()
  @EnumUtil.ApiProperty(ChannelType)
  channelType: ChannelType;

  @IsString()
  @EnumUtil.ApiProperty(ConsentType)
  consentType: ConsentType;

  @IsBoolean()
  hasGivenConsent: boolean;
}
