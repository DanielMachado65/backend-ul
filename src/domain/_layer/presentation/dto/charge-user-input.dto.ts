import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class ChargeUserInputDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userId: string;

  @IsNumber()
  @IsPositive()
  @IsInt()
  @ApiProperty()
  queryCode: number;
}
