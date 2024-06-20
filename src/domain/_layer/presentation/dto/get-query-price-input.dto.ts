import { IsInt, IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransformFnParams } from 'class-transformer/types/interfaces';
import { ApiProperty } from '@nestjs/swagger';

export class GetQueryPriceInputDto {
  @IsNumber()
  @IsInt()
  @IsPositive()
  @ApiProperty()
  @Transform(({ value }: TransformFnParams) => parseInt(value, 10))
  queryCode: number;
}
