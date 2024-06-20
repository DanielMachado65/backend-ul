import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsPositive, IsString } from 'class-validator';

export class RequestReview {
  @IsString()
  @ApiProperty()
  versionCode: string;

  @IsInt()
  @IsPositive()
  @ApiProperty()
  modelYear: number;

  @IsEmail()
  @ApiProperty()
  email: string;
}
