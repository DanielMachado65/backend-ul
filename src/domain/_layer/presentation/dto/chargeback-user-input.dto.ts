import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChargebackUserInputDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  balanceId: string;
}
