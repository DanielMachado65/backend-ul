import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsString } from 'class-validator';

export class TestimonialEssentialsEntity {
  @IsString()
  @ApiProperty()
  authorName: string;

  @IsString()
  @ApiProperty()
  content: string;

  @IsString()
  @ApiProperty()
  userId: string;
}

export class TestimonialEntity extends TestimonialEssentialsEntity {
  @IsISO8601()
  @ApiProperty()
  deletedAt: string;

  @IsISO8601()
  @ApiProperty()
  createdAt: string;

  @IsISO8601()
  @ApiProperty()
  updatedAt: string;
}
