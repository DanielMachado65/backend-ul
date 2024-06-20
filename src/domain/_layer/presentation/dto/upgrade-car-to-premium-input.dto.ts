import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpgradeCarToPremiumInputDto {
  @ApiProperty()
  @IsString()
  myCarProductId: string;

  @ApiProperty()
  @IsString()
  creditCardId: string;
}
