import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsNotEmpty, IsNotEmptyObject, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreditScoreDto } from 'src/domain/_layer/data/dto/credit-score.dto';
import { QueryKeysDto } from 'src/domain/_layer/data/dto/query-keys.dto';
import { VehicleDto } from 'src/domain/_layer/data/dto/vehicle.dto';
import { StringOrNull } from 'src/domain/types';

export enum ServiceResponseStatus {
  SUCCESS = 'SUCCESS',
  NO_DATA = 'NO_DATA',
  FAILED = 'FAILED',
}

export enum QueryResponseStatus {
  PENDING = 'PENDING',
  REPROCESSING = 'REPROCESSING',
  SUCCESS = 'SUCCESS',
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED',
}

export type QueryResult = {
  readonly id: string;
  readonly response: unknown;
  readonly keys: QueryKeysDto;
  readonly stackResult: readonly StackResult[];
};

export type StackResult = {
  readonly serviceId: string;
  readonly parentId?: string;
  readonly serviceReprocessedId?: string;
  readonly status: ServiceResponseStatus;
  readonly stackErrors?: ReadonlyArray<Error>;
  readonly providerResponse: unknown;
  readonly identifier: string;
  readonly serviceRef: StringOrNull;
  readonly createdAt?: string;
  readonly updateAt?: string;
};

export class QueryResponseEntity {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  templateQueryId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  templateQueryRef: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  queryRef: string;

  @IsNumber()
  @ApiProperty()
  executionTime: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  applicationId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(QueryResponseStatus)
  status: QueryResponseStatus;

  @IsNotEmptyObject()
  @ApiProperty()
  keys: QueryKeysDto;

  @IsOptional()
  response?: Partial<VehicleDto> & Partial<CreditScoreDto>;

  @IsOptional()
  stackResult?: ReadonlyArray<StackResult>;

  /**@deprecated - should use failedServices instead */
  @IsOptional()
  servicesToReprocess?: ReadonlyArray<string>;

  @IsOptional()
  failedServices?: ReadonlyArray<string>;

  @IsISO8601()
  @IsOptional()
  @ApiProperty()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  @ApiProperty()
  updateAt?: string;
}
