import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Matches, ValidateIf } from 'class-validator';

function validation(key: keyof QueryKeysDto): (QueryKeysEntity) => boolean {
  return (o: QueryKeysDto): boolean => !!o[key] || (!o.plate && !o.chassis && !o.engine);
}

export class QueryKeysDto {
  @ApiProperty({ required: false })
  @ValidateIf(validation('plate'))
  @Matches(/^[A-Za-z]{3}\d[A-Ja-j0-9]\d{2}$/)
  @Transform(({ value }: { readonly value: string }) => value && value.toUpperCase())
  plate?: string;

  @ApiProperty({ required: false })
  @ValidateIf(validation('chassis'))
  @IsString()
  @Transform(({ value }: { readonly value: string }) => value && value.toUpperCase())
  chassis?: string;

  @ApiProperty({ required: false })
  @ValidateIf(validation('engine'))
  @IsString()
  @Transform(({ value }: { readonly value: string }) => value && value.toUpperCase())
  engine?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  engineCapacity?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  modelYear?: number;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  fipeIds?: ReadonlyArray<string>;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fipeId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  year?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  modelBrandCode?: number;

  @IsString()
  @IsOptional()
  cpf?: string;

  @IsString()
  @IsOptional()
  cnpj?: string;

  zipCode?: string;
}
