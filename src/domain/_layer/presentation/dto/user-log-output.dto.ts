import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsString } from 'class-validator';

export class UserLogDto {
  @IsString()
  @ApiProperty()
  readonly id: string;

  @IsString()
  @ApiProperty()
  readonly token: string;

  @IsString()
  @ApiProperty()
  readonly actionDescription: string;

  @IsString()
  @ApiProperty()
  readonly actionName: string;

  @IsISO8601()
  @ApiProperty()
  readonly createdAt: string;
}
