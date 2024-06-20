import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

export class BlogPostResponseEntity {
  @ApiProperty()
  @IsString()
  @IsUrl()
  link: string;

  @ApiProperty()
  @IsString()
  @IsUrl()
  @IsOptional()
  thumbnailImageUrl: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  texts: ReadonlyArray<string>;
}

export class TestDriveVehicleBlogReviewEntity {
  @ApiProperty({ type: [BlogPostResponseEntity] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlogPostResponseEntity)
  blogPosts: ReadonlyArray<BlogPostResponseEntity>;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  saibaMais: ReadonlyArray<string>;

  @IsString()
  urlDescription: string;

  @IsString()
  bgColor: string;
}
