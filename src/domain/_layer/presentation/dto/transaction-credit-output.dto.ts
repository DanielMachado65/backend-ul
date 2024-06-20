import { ApiProperty } from '@nestjs/swagger';

export class TransactionCreditOutput {
  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  indicatedName: string;

  @ApiProperty()
  originValueInCents: number;

  @ApiProperty()
  valueInCents: number;
}

export type TransactionCreditOutputDto = ReadonlyArray<TransactionCreditOutput>;
