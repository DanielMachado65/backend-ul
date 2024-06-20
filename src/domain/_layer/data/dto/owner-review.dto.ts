import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationOf } from './pagination.dto';
import { OwnerReviewQueryEntity } from 'src/domain/_entity/owner-review-query.entity';
import { VehicleBasicInfoDto } from './vehicle-selectable-option.dto';

export class OwnerDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsBoolean()
  anonymous: boolean;
}

export class RankingDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  comfort: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  cambium: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  cityConsumption: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  roadConsumption: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  performance: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  drivability: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  internalSpace: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  stability: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  brakes: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  trunk: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  suspension: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  costBenefit: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  totalScore: number;
}

export class OwnerReviewDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  plate: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => OwnerDto)
  @IsOptional()
  owner?: OwnerDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => RankingDto)
  @IsOptional()
  ranking?: RankingDto;

  @ApiProperty()
  @IsString()
  @IsOptional()
  strengths?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  cons?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  flaws?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  generalFeedback?: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  mileage: number;

  @ApiProperty()
  @IsISO8601()
  createdAt: string;
}

export class CarReviewDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  license_plate: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  strengths?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  cons?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  flaws?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  general_feedback?: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  km: number;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  acquisition_year: number;
}

export class CarOwnerReviewDto {
  @ApiProperty()
  @IsObject()
  @Type(() => OwnerDto)
  @ValidateNested()
  user: OwnerDto;

  @ApiProperty()
  @IsObject()
  @Type(() => RankingDto)
  ranking: RankingDto;

  @ApiProperty()
  @IsObject()
  @Type(() => CarReviewDto)
  review: CarReviewDto;

  @ApiProperty()
  @IsObject()
  @Type(() => VehicleBasicInfoDto)
  @ValidateNested()
  vehicle: VehicleBasicInfoDto;
}

export class ReviewEngagementDto {
  @IsNumber()
  @IsPositive()
  likes: number;

  @IsNumber()
  @IsPositive()
  dislikes: number;
}

export class ShortOwnerDto {
  @ApiProperty()
  @IsString()
  name: string;
}

export class BrandDto {
  @ApiProperty()
  @IsString()
  name: string;
}

export class ModelDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  code: string;
}

export class VersionDto {
  @ApiProperty()
  @IsNumber()
  year: number;

  @ApiProperty()
  @IsString()
  fipeId: string;
}

export class OwnerReviewFullDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNumber()
  averageScore: number;

  @ApiProperty()
  @IsString()
  strengths: string;

  @ApiProperty()
  @IsString()
  cons: string;

  @ApiProperty()
  @IsString()
  flaws: string;

  @ApiProperty()
  @IsString()
  generalFeedback: string;

  @ApiProperty()
  @IsNumber()
  km: number;

  @ApiProperty()
  @IsString()
  createdAt: string;

  @ApiProperty()
  @IsObject()
  owner: ShortOwnerDto;

  @ApiProperty()
  @IsObject()
  ranking: RankingDto;

  @ApiProperty()
  @IsObject()
  engagement: ReviewEngagementDto;

  @ApiProperty()
  @Type(() => BrandDto)
  brand: BrandDto;

  @ApiProperty()
  @Type(() => ModelDto)
  model: ModelDto;

  @ApiProperty()
  @Type(() => VersionDto)
  version: VersionDto;
}

export class OwnerReviewFullV2Dto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNumber()
  averageScore: number;

  @ApiProperty()
  @IsString()
  strengths: string;

  @ApiProperty()
  @IsString()
  cons: string;

  @ApiProperty()
  @IsString()
  flaws: string;

  @ApiProperty()
  @IsString()
  generalFeedback: string;

  @ApiProperty()
  @IsNumber()
  km: number;

  @ApiProperty()
  @IsString()
  createdAt: string;

  @ApiProperty()
  @IsObject()
  owner: ShortOwnerDto;

  @ApiProperty()
  @IsObject()
  ranking: RankingDto;

  @ApiProperty()
  @IsObject()
  engagement: ReviewEngagementDto;
}

export class OwnerReviewShortDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  averageScore: number;
}

export type FullPaginatedReviewsDto = PaginationOf<OwnerReviewFullDto>;

export type FullPaginatedReviewsV2Dto = PaginationOf<OwnerReviewFullDto>;

export type ShortPaginatedReviewsDto = PaginationOf<OwnerReviewShortDto>;

export type OwnerReviewQueryDto = OwnerReviewQueryEntity;
