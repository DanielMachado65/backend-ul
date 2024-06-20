import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReprocessQueryInputDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  queryId: string;
}
