import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export enum PaginatedReviewsFormat {
  SHORT = 'short',
  FULL = 'full',
}

export enum PaginatedReviewsOrdering {
  MOST_RATED = 'most_rated',
  RECENT = 'recent',
  OLD = 'old',
  HIGH_SCORE = 'high_score',
  LOW_SCORE = 'low_score',
  HIGH_KM = 'high_km',
  LOW_KM = 'low_km',
}

export class PaginatedReviewsFiltersInputDto {
  @IsString()
  @ApiProperty()
  brandName: string;

  @IsString()
  @ApiProperty()
  modelName: string;

  @Transform(({ value }: { readonly value: unknown }) => Number(value))
  @IsInt()
  @ApiProperty()
  modelYear: number;

  @IsString()
  @ApiProperty()
  detailedModel: string;

  @IsString()
  @IsEnum([
    PaginatedReviewsOrdering.MOST_RATED,
    PaginatedReviewsOrdering.RECENT,
    PaginatedReviewsOrdering.OLD,
    PaginatedReviewsOrdering.HIGH_SCORE,
    PaginatedReviewsOrdering.LOW_SCORE,
    PaginatedReviewsOrdering.HIGH_KM,
    PaginatedReviewsOrdering.LOW_KM,
  ])
  @IsOptional()
  @EnumUtil.ApiProperty(PaginatedReviewsOrdering)
  ordering: PaginatedReviewsOrdering = PaginatedReviewsOrdering.RECENT;
}

export class PaginatedReviewsFiltersV2InputDto {
  @IsString()
  @ApiProperty()
  brandName: string;

  @IsString()
  @ApiProperty()
  modelName: string;

  @Transform(({ value }: { readonly value: unknown }) => Number(value))
  @IsInt()
  @ApiProperty()
  modelYear: number;

  @IsString()
  @ApiProperty()
  versionCode: string;

  @IsString()
  @IsEnum([
    PaginatedReviewsOrdering.MOST_RATED,
    PaginatedReviewsOrdering.RECENT,
    PaginatedReviewsOrdering.OLD,
    PaginatedReviewsOrdering.HIGH_SCORE,
    PaginatedReviewsOrdering.LOW_SCORE,
    PaginatedReviewsOrdering.HIGH_KM,
    PaginatedReviewsOrdering.LOW_KM,
  ])
  @IsOptional()
  @EnumUtil.ApiProperty(PaginatedReviewsOrdering)
  ordering: PaginatedReviewsOrdering = PaginatedReviewsOrdering.RECENT;
}
