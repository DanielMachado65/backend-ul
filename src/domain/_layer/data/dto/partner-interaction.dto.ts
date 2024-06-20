import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PartnerInteractionDto {
  @IsString()
  @ApiProperty()
  link: string;

  @IsString()
  @ApiProperty()
  queryId: string;
}
