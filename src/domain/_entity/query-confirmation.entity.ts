import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

export class QueryConfirmationVersions {
  @ApiProperty()
  @IsString()
  fipeId: string;

  @ApiProperty()
  @IsString()
  name: string;
}

export class QueryConfirmationEntity {
  @ApiProperty()
  @IsString()
  placa?: string;

  @ApiProperty()
  @IsString()
  chassi?: string;

  @ApiProperty()
  @IsString()
  marca?: string;

  @ApiProperty()
  @IsString()
  modelo?: string;

  @ApiProperty()
  @IsString()
  marcaImagem?: string;

  @ApiProperty({ type: [QueryConfirmationVersions] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueryConfirmationVersions)
  versoes: ReadonlyArray<QueryConfirmationVersions>;
}
