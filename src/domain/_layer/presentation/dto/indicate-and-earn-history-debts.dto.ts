import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601 } from 'class-validator';

export enum IndicateAndEarnInstanceDebitType {
  CREDIT = 'CREDIT',
  DEBIT_WITHDRAWAL = 'DEBIT_WITHDRAWAL',
  DEBIT_WITH_CONVERSION = 'DEBIT_ONC_WALLET',
}

export enum IndicateAndEarnInstanceDebitStatus {
  CREATED = 'CRIADA',
  RECEIVED = 'RECEBIDA',
  FAIL = 'FALHA',
  FINISH = 'FINALIZADO',
  RETURNED = 'DEVOLVIDO',
}

export class IndicateAndEarnInstanceDebit {
  @ApiProperty()
  @IsISO8601()
  createdAt: string;

  @ApiProperty({ enum: IndicateAndEarnInstanceDebitStatus })
  @IsEnum(IndicateAndEarnInstanceDebitStatus)
  status: IndicateAndEarnInstanceDebitStatus;

  @ApiProperty({ enum: IndicateAndEarnInstanceDebitType })
  @IsEnum(IndicateAndEarnInstanceDebitType)
  type: IndicateAndEarnInstanceDebitType;

  @ApiProperty()
  valueInCents: number;
}
