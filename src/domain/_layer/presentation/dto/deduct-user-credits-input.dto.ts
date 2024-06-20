import { IsInt, IsNegative, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransformFnParams } from 'class-transformer/types/interfaces';
import { ApiProperty } from '@nestjs/swagger';

export class DeductUserCreditsInputDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userId: string;

  @IsNumber()
  @IsNegative()
  @IsInt()
  @ApiProperty()
  @Transform(({ value }: TransformFnParams) => value * -1)
  valueInCents: number;
}
