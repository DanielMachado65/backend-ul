import { IsISO8601, IsNumber, IsObject, IsOptional, IsPositive, IsString, IsUrl } from 'class-validator';

export class HttpLogReqParams {
  queryParams: string | Record<string, unknown>;
  body: string | Record<string, unknown>;
}

export class HttpLogEntity {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  parentId: string;

  @IsString()
  @IsOptional()
  target: string;

  @IsString()
  actor: string;

  @IsString()
  method: string;

  @IsUrl()
  url: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  statusCode?: number;

  @IsObject()
  requestHeaders: Record<string, unknown>;

  @IsOptional()
  requestParams?: string | HttpLogReqParams;

  @IsObject()
  @IsOptional()
  responseHeaders?: Record<string, unknown>;

  @IsOptional()
  responseBody?: string | Record<string, unknown>;

  @IsISO8601()
  startAt: string;

  @IsISO8601()
  @IsOptional()
  endAt?: string;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;
}
