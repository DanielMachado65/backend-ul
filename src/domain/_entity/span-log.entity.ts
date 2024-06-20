import { IsArray, IsBoolean, IsISO8601, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class SpanLogEntity {
  @IsString()
  id?: string;

  @IsString()
  @IsOptional()
  traceId: string;

  @IsString()
  @IsOptional()
  traceName: string;

  @IsString()
  @IsOptional()
  targetName: string;

  @IsISO8601()
  @IsOptional()
  startAt: string;

  @IsISO8601()
  @IsOptional()
  endAt?: string;

  @IsNumber()
  @IsOptional()
  spanTime: number;

  @IsBoolean()
  @IsOptional()
  isSuccess: boolean;

  @IsArray()
  @IsOptional()
  params: ReadonlyArray<unknown>;

  @IsObject()
  @IsOptional()
  response: unknown;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;
}
