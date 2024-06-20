import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';

type DatasheetBlockTypes = 'key-value' | 'series';

export class DatasheetBlock<Type extends DatasheetBlockTypes> {
  @IsString()
  @ApiProperty()
  type: Type;
}

export class KeyValueReviewDatasheetBlockItem {
  @IsString()
  @ApiProperty()
  key: string;

  @IsString()
  @ApiProperty()
  value: string;
}

export class KeyValueReviewDatasheetBlock extends DatasheetBlock<'key-value'> {
  @IsString()
  @ApiProperty()
  key: string;

  @Type(() => KeyValueReviewDatasheetBlockItem)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [KeyValueReviewDatasheetBlockItem] })
  items: ReadonlyArray<KeyValueReviewDatasheetBlockItem>;
}

export type SeriesReviewDatasheetBlockItem = {
  readonly key: string;
  readonly type: 'available' | 'unable' | 'optional';
};

export class SeriesReviewDatasheetBlock extends DatasheetBlock<'series'> {
  @IsString()
  @ApiProperty()
  key: string;

  @IsArray()
  @ApiProperty()
  items: ReadonlyArray<SeriesReviewDatasheetBlockItem>;
}

export type ReviewDatasheetBlocks = KeyValueReviewDatasheetBlock | SeriesReviewDatasheetBlock;

export class OwnerReviewQueryResultMainData {
  @IsString()
  @ApiProperty()
  key: string;

  @IsString()
  @ApiProperty()
  value: string;
}

export class OwnerReviewQueryResultImage {
  @IsString()
  @ApiProperty()
  imgSrc: string;
}

export class OwnerReviewQueryResultPartnerBlogPost {
  @IsString()
  @ApiProperty()
  blogUrl: string;
}

export class OwnerReviewQueryResultPartnerVideoPost {
  @IsString()
  @ApiProperty()
  videoUrl: string;
}

export class OwnerReviewQueryReview {
  @Type(() => OwnerReviewQueryResultPartnerBlogPost)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [OwnerReviewQueryResultPartnerBlogPost] })
  blogPosts: OwnerReviewQueryResultPartnerBlogPost[];

  @Type(() => OwnerReviewQueryResultPartnerVideoPost)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [OwnerReviewQueryResultPartnerVideoPost] })
  videoPosts: OwnerReviewQueryResultPartnerVideoPost[];
}

export class OwnerReviewQueryResult {
  @IsEnum([KeyValueReviewDatasheetBlock, SeriesReviewDatasheetBlock])
  @ApiProperty()
  blocks: ReadonlyArray<ReviewDatasheetBlocks> | null;

  @Type(() => OwnerReviewQueryResultMainData)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [OwnerReviewQueryResultMainData] })
  mainVehicleData: ReadonlyArray<OwnerReviewQueryResultMainData> | null;

  @Type(() => OwnerReviewQueryResultImage)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [OwnerReviewQueryResultImage] })
  images: ReadonlyArray<OwnerReviewQueryResultImage> | null;

  @Type(() => OwnerReviewQueryReview)
  @ValidateNested()
  @ApiProperty({ type: [OwnerReviewQueryReview] })
  review: OwnerReviewQueryReview;
}
