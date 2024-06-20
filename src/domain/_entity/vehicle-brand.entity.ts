import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VehicleBrandEntity {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  image: string;
}
