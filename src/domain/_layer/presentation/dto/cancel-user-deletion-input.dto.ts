import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { LowerCase } from 'src/infrastructure/decorators/lowercase.decorator';

export class CancelUserDeletionInputDto {
  @LowerCase()
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;
}
