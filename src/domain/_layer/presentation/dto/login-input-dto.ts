import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { LowerCase } from 'src/infrastructure/decorators/lowercase.decorator';

export class LoginInputDto {
  @LowerCase()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
