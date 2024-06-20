import { ApiProperty } from '@nestjs/swagger';

export enum TransactionDebtsStatus {
  CRIADA = 'CRIADA',
  RECEBIDA = 'RECEBIDA',
  FALHA = 'FALHA',
  FINALIZADO = 'FINALIZADO',
  DEVOLVIDO = 'DEVOLVIDO',
}

export enum TransactionDebtsType {
  DEBIT_ONC_WALLET = 'DEBIT_ONC_WALLET',
  DEBIT_WITHDRAWAL = 'DEBIT_WITHDRAWAL',
}

export class TransactionDebitWithdrawal {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly valueInCents: number;

  @ApiProperty()
  readonly status: string;

  @ApiProperty()
  readonly indicatedId: string;

  @ApiProperty()
  readonly indicatedName: string;

  @ApiProperty()
  readonly indicatedEmail: string;

  @ApiProperty()
  readonly indicatedCpf: string;

  @ApiProperty()
  readonly originValue: number;

  @ApiProperty()
  readonly createdAt: string;

  @ApiProperty()
  readonly updatedAt: string;

  @ApiProperty()
  readonly participantId: string;
}
