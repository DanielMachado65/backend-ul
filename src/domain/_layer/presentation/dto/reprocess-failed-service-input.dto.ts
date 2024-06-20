import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReprocessFailedServiceInputDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  queryId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  serviceLogId: string;
}
