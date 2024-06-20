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
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';
import { QueryKeysEntity } from './query-keys.entity';
import { QueryFailedService, QueryRules, QueryStatus } from './query.entity';

export abstract class Field {
  @ApiProperty()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fieldType: string;
}

export abstract class ActionDispatch {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => String)
  codes: ReadonlyArray<string>;
}

export abstract class Action {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  listener: string;

  @ApiProperty({ type: [ActionDispatch] })
  @ValidateNested({ each: true })
  @Type(() => ActionDispatch)
  dispatches: ReadonlyArray<ActionDispatch>;
}

export abstract class Badge {
  @ApiProperty()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ type: [Field] })
  @ValidateNested({ each: true })
  @Type(() => Field)
  fields: ReadonlyArray<Field>;

  @ApiProperty({ type: [Action] })
  @ValidateNested({ each: true })
  @Type(() => Action)
  actions: ReadonlyArray<Action>;

  @ApiProperty()
  @IsObject()
  options: Record<string, unknown>;
}

export abstract class Component {
  @ApiProperty()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty()
  @IsBoolean()
  isPrintable: boolean;

  @ApiProperty({ type: [Field] })
  @ValidateNested({ each: true })
  @Type(() => Field)
  fields: ReadonlyArray<Field>;

  @ApiProperty({ type: [Action] })
  @ValidateNested({ each: true })
  @Type(() => Action)
  actions: ReadonlyArray<Action>;

  @ApiProperty()
  @IsObject()
  options: Record<string, unknown>;
}

export abstract class Product {
  @ApiProperty()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty()
  @IsBoolean()
  isPrintable: boolean;

  @ApiProperty({ type: [Field] })
  @ValidateNested({ each: true })
  @Type(() => Field)
  fields: ReadonlyArray<Field>;

  @ApiProperty({ type: [Action] })
  @ValidateNested({ each: true })
  @Type(() => Action)
  actions: ReadonlyArray<Action>;

  @ApiProperty()
  @IsObject()
  options: Record<string, unknown>;
}

export abstract class QueryParsedData {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsInt()
  code: number;

  @ApiProperty({ type: [Badge] })
  @ValidateNested({ each: true })
  @Type(() => Badge)
  badges: ReadonlyArray<Badge>;

  @ApiProperty({ type: [Component] })
  @ValidateNested({ each: true })
  @Type(() => Component)
  components: ReadonlyArray<Component>;

  @ApiProperty({ type: [Product] })
  @ValidateNested({ each: true })
  @Type(() => Product)
  products: ReadonlyArray<Product>;
}

export class QueryRepresentationEntity {
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

  @ApiProperty()
  @IsString()
  plate: string;

  @ApiProperty()
  @IsString()
  brandAndModel: string;

  @ApiProperty()
  @IsString()
  brandImageUrl: string;

  @ApiProperty()
  @IsISO8601()
  createdAt: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => QueryKeysEntity)
  keys: QueryKeysEntity;

  @ApiProperty()
  @ValidateNested()
  @Type(() => QueryParsedData)
  dsl?: QueryParsedData;

  @ApiProperty({ type: [QueryFailedService] })
  @ValidateNested({ each: true })
  @Type(() => QueryFailedService)
  failedServices: ReadonlyArray<QueryFailedService>;

  @EnumUtil.ApiProperty(QueryStatus)
  @IsEnum(QueryStatus)
  @IsBoolean()
  status: QueryStatus;

  @EnumUtil.ApiProperty(QueryStatus)
  @IsEnum(QueryStatus)
  queryStatus: QueryStatus;

  @IsOptional()
  @IsNumber()
  version?: number;

  @ApiProperty()
  @IsArray()
  rules: QueryRules[];
}

export class PopUpQuery<Other = Record<string, string>> {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  headerText: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  footerText: string;

  @ApiProperty()
  @IsObject()
  other: Other;
}

export class QueryRepresentationWithPopUpEntity extends QueryRepresentationEntity {
  @ApiProperty({ type: [PopUpQuery] })
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => PopUpQuery)
  popups: ReadonlyArray<PopUpQuery>;
}
