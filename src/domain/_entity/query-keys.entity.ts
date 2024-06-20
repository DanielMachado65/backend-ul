import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches, ValidateIf } from 'class-validator';
import { CreditQueryKeysEntity } from 'src/domain/_entity/credit-score.entity';
import { IsCPF } from 'src/infrastructure/decorators';

function validation(key: keyof QueryKeysEntity): (QueryKeysEntity) => boolean {
  return (o: QueryKeysEntity): boolean => !!o[key] || (!o.plate && !o.chassis && !o.engine && !o.cpf && !o.cnpj);
}

export class QueryKeysEntity {
  @ApiProperty()
  @ValidateIf(validation('plate'))
  @Matches(/^[A-Za-z]{3}\d[A-Ja-j0-9]\d{2}$/)
  @Transform(({ value }: { readonly value: string }) => value && value.toUpperCase())
  plate?: string;

  @ApiProperty()
  @ValidateIf(validation('chassis'))
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { readonly value: string }) => value && value.toUpperCase())
  chassis?: string;

  @ApiProperty()
  @ValidateIf(validation('engine'))
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { readonly value: string }) => value && value.toUpperCase())
  engine?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsCPF()
  @ValidateIf(validation('cpf'))
  cpf?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ValidateIf(validation('cnpj'))
  cnpj?: string;

  zipCode?: string;
}

export type AllQueryKeys = QueryKeysEntity | CreditQueryKeysEntity;
