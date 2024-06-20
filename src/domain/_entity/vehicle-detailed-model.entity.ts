import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VehicleDetailedModelEntity {
  @IsString()
  @ApiProperty()
  detailedModel: string;
}
