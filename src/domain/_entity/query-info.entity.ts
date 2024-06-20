import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsString } from 'class-validator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export enum QueryInfoAvailability {
  NONE = 'none',
  MAYBE = 'maybe',
  ALWAYS = 'always',
}

export const queryInfoAvailabilities: ReadonlyArray<QueryInfoAvailability> = [
  QueryInfoAvailability.NONE,
  QueryInfoAvailability.MAYBE,
  QueryInfoAvailability.ALWAYS,
];

export class QueryInfoEssentialsEntity {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @IsEnum(QueryInfoAvailability)
  @EnumUtil.ApiProperty(QueryInfoAvailability)
  isAvailable: QueryInfoAvailability;

  @IsString()
  @IsEnum(QueryInfoAvailability)
  @EnumUtil.ApiProperty(QueryInfoAvailability)
  isAvailableToOthers: QueryInfoAvailability;

  @IsString()
  @ApiProperty()
  description: string;
}

export class QueryInfoEntity extends QueryInfoEssentialsEntity {
  @IsString()
  @ApiProperty()
  image: string;

  @IsISO8601()
  @ApiProperty()
  deletedAt: string;

  @IsISO8601()
  @ApiProperty()
  updatedAt: string;

  @IsISO8601()
  @ApiProperty()
  createdAt: string;
}
