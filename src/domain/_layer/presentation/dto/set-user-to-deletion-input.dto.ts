import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SetUserToDeletionInputDto {
  @IsString()
  @ApiProperty()
  password: string;
}
