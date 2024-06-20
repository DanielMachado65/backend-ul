import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VehicleModelYearEntity {
  @IsString()
  @ApiProperty()
  year: number;
}
