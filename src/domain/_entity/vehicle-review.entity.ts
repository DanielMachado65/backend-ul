import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsPositive, IsString, IsUrl, ValidateNested } from 'class-validator';

export class BlogPostEntity {
  @ApiProperty()
  @IsString()
  @IsUrl()
  blogUrl: string;
}

export class VideoPostEntity {
  @ApiProperty()
  @IsString()
  @IsUrl()
  videoUrl: string;
}

export class TestDriveVehicleReviewEntity {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  codigoMarcaModelo: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  anoModelo: number;

  @ApiProperty({ type: [BlogPostEntity] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlogPostEntity)
  blogPosts: ReadonlyArray<BlogPostEntity>;

  @ApiProperty({ type: [VideoPostEntity] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoPostEntity)
  videoPosts: ReadonlyArray<VideoPostEntity>;
}
