import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StateDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  region: string;

  @IsString()
  @ApiProperty()
  code: string;
}
