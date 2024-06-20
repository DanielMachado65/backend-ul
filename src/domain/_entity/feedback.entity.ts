import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class FeedbackEntity {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  user: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  query: string;

  @Min(1)
  @Max(10)
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  evaluation: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  @Length(0, 5000)
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  refMonth: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  refYear: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  createdAt: string;
}
