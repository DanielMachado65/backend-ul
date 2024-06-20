import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VehicleModelEntity {
  @IsString()
  @ApiProperty()
  name: string;
}
