import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

export class VideoPostResponseEntity {
  @ApiProperty()
  @IsString()
  @IsUrl()
  @IsOptional()
  embedUrl: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title: string;
}

export class TestDriveVehicleYoutubeReviewEntity {
  @ApiProperty({ type: [VideoPostResponseEntity] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoPostResponseEntity)
  videoPosts: ReadonlyArray<VideoPostResponseEntity>;

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
