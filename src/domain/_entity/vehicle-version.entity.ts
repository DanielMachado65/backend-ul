import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VehicleVersionEntity {
  @IsString()
  @ApiProperty()
  fipeId: string;

  @IsString()
  @ApiProperty()
  versionName: string;
}
