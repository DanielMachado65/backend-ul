import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AccountFundsDto {
  @ApiProperty()
  @IsInt()
  accountFunds: number;
}
