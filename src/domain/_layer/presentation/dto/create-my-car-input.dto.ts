import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RegisterMyCarInputDto {
  @IsString()
  @ApiProperty()
  fipeId: string;

  @IsString()
  @ApiProperty()
  plate: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  creditCardId?: string;
}
