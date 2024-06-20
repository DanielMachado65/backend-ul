import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransformFnParams } from 'class-transformer/types/interfaces';

export class GetPartnerIncomingInputDto {
  @ApiProperty()
  @IsNumber()
  @IsInt()
  @Min(0)
  @Max(11)
  @Transform(({ value }: TransformFnParams) => parseInt(value, 10))
  month: number;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @Min(1900)
  @Max(2100)
  @Transform(({ value }: TransformFnParams) => parseInt(value, 10))
  year: number;
}
