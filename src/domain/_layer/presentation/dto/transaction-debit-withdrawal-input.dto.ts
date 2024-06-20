import { ApiProperty } from '@nestjs/swagger';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export enum PixType {
  EMAIL = 'EMAIL',
  CPF = 'CPF',
  PHONE = 'PHONE',
  RANDOM_KEY = 'RANDOM_KEY',
  CNPJ = 'CNPJ',
}

export class TransactionDebitWithdrawalBodyInputDto {
  @EnumUtil.ApiProperty(PixType)
  readonly pixType: PixType;

  @ApiProperty()
  readonly pixKey: string;

  @ApiProperty({ description: 'Value (in cents) for the given transaction', example: 123 })
  readonly valueInCents: number;
}
