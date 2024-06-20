import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class OwnerVehicleParams {
  @IsString()
  @ApiProperty()
  brandName: string;

  @IsString()
  @ApiProperty()
  modelName: string;

  @IsNumber()
  @ApiProperty()
  modelYear: number;

  @IsString()
  @ApiProperty()
  detailedModel: string;
}
