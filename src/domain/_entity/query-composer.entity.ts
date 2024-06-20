import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export enum QueryComposerType {
  VEHICULAR = 'Vehicular Query',
  PERSON = 'Person Query',
  PERSON_GROUP = 'Person Group Query',
  CREDIT = 'Credit Query',
}

export const allQueryComposerType: ReadonlyArray<QueryComposerType> = [
  QueryComposerType.VEHICULAR,
  QueryComposerType.PERSON,
  QueryComposerType.PERSON_GROUP,
  QueryComposerType.CREDIT,
];

export enum QueryComposeStatus {
  ACTIVATED = 'activated',
  DISABLED = 'disabled',
}

export class QueryComposerEntity {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  createdAt: string;

  @EnumUtil.ApiProperty(QueryComposeStatus)
  @IsEnum(QueryComposeStatus)
  status: QueryComposeStatus;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  queryCode: number;

  @ApiProperty()
  @IsString()
  name: string;

  @EnumUtil.ApiProperty(QueryComposerType)
  @IsEnum(QueryComposerType)
  queryType: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isRecommended: boolean;

  @ApiProperty()
  @IsBoolean()
  isNewFeature: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  showInComparisonTable: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fullDescription: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  shortDescription: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  faqIds: ReadonlyArray<string>;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  queryInfoIds: ReadonlyArray<string>;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  testimonialIds: ReadonlyArray<string>;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  exampleQueryId: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  serviceIds: ReadonlyArray<string>;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  queryMapId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  queryRulesId: string;

  @ApiProperty()
  @IsBoolean()
  buyable: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  canBeTestDrive?: boolean;
}
