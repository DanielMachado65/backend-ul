import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetTestDriveParamInputDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  queryId: string;
}
