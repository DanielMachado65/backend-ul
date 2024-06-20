import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export abstract class PaginationInputDto {
  @ApiPropertyOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value, 10))
  @IsNumber()
  @IsInt()
  @IsPositive()
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value, 10))
  @IsNumber()
  @IsInt()
  @IsPositive()
  @IsOptional()
  readonly perPage?: number = 10;
}
