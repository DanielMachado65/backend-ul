import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsISO8601, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';
import { QueryDocumentType, QueryStatus } from '../../../_entity/query.entity';

export class QueryHistoryItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  code: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @EnumUtil.ApiProperty(QueryStatus)
  @IsEnum(QueryStatus)
  status: QueryStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentQuery: string;

  @EnumUtil.ApiProperty(QueryDocumentType)
  @IsEnum(QueryDocumentType)
  documentType: QueryDocumentType;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  executionTime: number;

  @ApiProperty()
  @IsISO8601()
  createdAt: string;
}
