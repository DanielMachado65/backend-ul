import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CityDto {
  @IsString()
  @ApiProperty()
  name: string;
}
