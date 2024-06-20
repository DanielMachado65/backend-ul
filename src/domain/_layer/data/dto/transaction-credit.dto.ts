import { ApiProperty } from '@nestjs/swagger';

export class TransactionCredit {
  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  indicatedName: string;

  @ApiProperty()
  originValueInCents: number;

  @ApiProperty()
  valueInCents: number;
}
