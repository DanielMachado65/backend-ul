import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserConsentInputDto {
  @IsBoolean()
  @ApiProperty()
  hasGivenConsent: boolean;
}
