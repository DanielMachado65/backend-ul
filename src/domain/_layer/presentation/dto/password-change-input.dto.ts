import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordChangeInputDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  resetToken: string;

  @IsString()
  @MinLength(4)
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
