import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CityZipCodeEntity {
  @IsString()
  @ApiProperty()
  city: string;

  @IsString()
  @ApiProperty()
  state: string;

  @IsString()
  @ApiProperty()
  zipcode: string;
}
