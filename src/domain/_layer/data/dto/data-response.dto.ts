import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DataReponseDto<OfWhat> {
  @ApiProperty()
  @IsNotEmpty()
  data: OfWhat;
}
