import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetOwnerReviewsInputDto {
  @ApiProperty()
  @IsString()
  brandModelCode: string = '';

  @ApiProperty()
  @IsString()
  fipeId: string = '';
}
