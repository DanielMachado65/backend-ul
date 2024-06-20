import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PreQueryEntity {
  @ApiProperty()
  @IsString()
  plate: string;

  @ApiProperty()
  @IsString()
  chassis: string;

  @ApiProperty()
  @IsString()
  engineNumber: string;

  @ApiProperty()
  @IsString()
  brand: string;

  @ApiProperty()
  @IsString()
  model: string;
}
