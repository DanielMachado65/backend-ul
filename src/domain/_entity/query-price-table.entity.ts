import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QueryComposerType } from './query-composer.entity';

// export abstract class QueryPriceTableTemplateItemConsumptionRange {
//   @IsNumber()
//   rangeStart: number;
//
//   @IsNumber()
//   price: number;
// }

export class QueryPriceTableTemplateItem {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  queryCode: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  queryName?: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsInt()
  @IsOptional()
  marketingPriceCents?: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsInt()
  totalPriceCents: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsInt()
  oldPriceCents: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  queryComposerId: string;

  @ApiProperty()
  @IsEnum(QueryComposerType)
  @IsOptional()
  type?: QueryComposerType;
}

export abstract class QueryPriceTableEntity {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueryPriceTableTemplateItem)
  template: ReadonlyArray<QueryPriceTableTemplateItem>;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  creatorId: string;
}
