import { ApiProperty } from '@nestjs/swagger';

export class TransactionDebitWithOncWalletBodyDto {
  @ApiProperty({ description: 'Value (in cents) for the given transaction', example: 123 })
  readonly valueInCents: number;
}
