import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class IndicateAndEarnFundsDto {
  @ApiProperty()
  @IsInt()
  realAmountInCents: number;

  @ApiProperty()
  @IsInt()
  totalCommittedInCents: number;

  @ApiProperty()
  @IsInt()
  totalGainInCents: number;

  @ApiProperty()
  @IsInt()
  totalWithdrawnInCents: number;
}
