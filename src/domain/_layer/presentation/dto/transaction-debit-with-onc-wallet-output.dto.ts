import { ApiProperty } from '@nestjs/swagger';

export class TransactionDebitWithOncWalletSuccess {
  @ApiProperty()
  valueInCents: number;
}
