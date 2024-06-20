import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeedbackInputDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  queryId: string;

  @Min(1)
  @Max(10)
  @IsNumber()
  @ApiProperty()
  evaluation: number;

  @ApiPropertyOptional()
  description?: string;
}

export class GetFeedbackDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  queryId: string;
}
