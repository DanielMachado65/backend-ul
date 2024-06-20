import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class EngageOwnerReviewDto {
  @IsString()
  @IsEnum(['like', 'dislike'])
  @ApiProperty({ enum: ['like', 'dislike'] })
  reaction: 'like' | 'dislike';
}
