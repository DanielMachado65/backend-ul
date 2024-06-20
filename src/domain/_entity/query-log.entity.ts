import { IsBoolean, IsInt, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export abstract class QueryLogEntity {
  @IsString()
  id: string;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  queryId: string;

  @IsBoolean()
  status: boolean;

  @IsString()
  @IsNotEmpty()
  errorMessage: string;

  @IsNumber()
  @IsInt()
  @IsPositive()
  errorCode: number;
}
