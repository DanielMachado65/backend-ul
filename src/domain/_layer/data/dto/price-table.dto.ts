import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { QueryComposerType } from 'src/domain/_entity/query-composer.entity';
import { FaqDto } from 'src/domain/_layer/data/dto/faq.dto';
import { QueryInfoWithoutTimestampsDto } from 'src/domain/_layer/data/dto/query-info.dto';
import { TestimonialWithoutTimestampsDto } from 'src/domain/_layer/data/dto/testimonial.dto';
import { QueryPriceTableEntity } from '../../../_entity/query-price-table.entity';

export type PriceTableDto = QueryPriceTableEntity;

export class DetailedPriceTableDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt?: string;

  @ApiProperty({ type: () => DetailedPriceTableTemplate, isArray: true })
  template: ReadonlyArray<DetailedPriceTableTemplate>;
}

export class QueryInfoCompose {
  @ApiProperty()
  name: string;
}

class DetailedPriceTableQueryCompose {
  @ApiProperty()
  id: string;

  @ApiProperty()
  queryCode: number;

  @ApiProperty()
  status: boolean;

  @ApiProperty()
  isRecommended: boolean;

  @ApiProperty()
  showInComparisonTable: boolean;

  @ApiProperty()
  fullDescription: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  exampleQuery: string;

  @ApiProperty()
  createAt: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  buyable: boolean;

  @ApiProperty()
  name: string;
}

export class DetailedPriceTableTemplate {
  @ApiProperty()
  id: string;

  @ApiProperty()
  querycode: number;

  @ApiProperty()
  totalPriceCents: number;

  @ApiProperty()
  marketingPriceCents: number;

  @ApiProperty({ type: () => DetailedPriceTableQueryCompose })
  queryComposer: DetailedPriceTableQueryCompose;

  @ApiProperty({ type: () => [QueryInfoCompose] })
  queryInfos: ReadonlyArray<QueryInfoCompose>;
}

export type PriceTableProductFaq = Pick<FaqDto, 'title' | 'answer'>;

export abstract class PriceTableProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly code: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly exampleQuery: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  readonly isRecommended: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  readonly showInComparisonTable: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly fullDescription: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly shortDescription: string;

  @ApiProperty()
  @IsArray()
  readonly faq: ReadonlyArray<PriceTableProductFaq>;

  @ApiProperty()
  @IsArray()
  readonly queryInfos: ReadonlyArray<QueryInfoWithoutTimestampsDto>;

  @ApiProperty()
  @IsArray()
  readonly testimonials: ReadonlyArray<TestimonialWithoutTimestampsDto>;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly marketingPrice: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly totalPrice: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  readonly buyable: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly type: QueryComposerType;
}

export abstract class PriceTableAvailableQueryDto {
  @ApiProperty()
  queryCode: number;

  @ApiProperty()
  marketingPriceInCents: number;

  @ApiProperty()
  totalPriceInCents: number;

  @ApiProperty()
  name: string;
}

export abstract class PriceTableLabelDto {
  @ApiProperty()
  value: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  _id: string;
}

export abstract class PriceTablePlanDto {
  @ApiProperty()
  availableQueries: PriceTableAvailableQueryDto[];

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  valueInCents: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  label: PriceTableLabelDto;
}
