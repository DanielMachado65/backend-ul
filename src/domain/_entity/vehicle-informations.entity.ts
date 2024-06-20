import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class VehicleInformationsEntity {
  @IsBoolean()
  @ApiProperty()
  hasKm: boolean;

  @IsBoolean()
  @ApiProperty()
  hasPhotos: boolean;
}
