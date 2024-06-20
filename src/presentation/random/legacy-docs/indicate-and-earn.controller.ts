import { Controller, Get, Post } from '@nestjs/common';
import {
  ApiGoneResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiProperty,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { Roles } from '../../../infrastructure/guard/roles.guard';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

class HashLinkData {
  @ApiProperty()
  readonly hashLink: string;
}

class DefaultDataError {}

class CreateHashSuccess {
  @ApiProperty()
  status: number;

  @ApiProperty({ type: () => HashLinkData })
  body: HashLinkData;
}

class DefaultError {
  @ApiProperty()
  status: number;

  @ApiProperty({ type: () => DefaultDataError })
  body: DefaultDataError;
}

enum TransactionDebtsStatus {
  CRIADA = 'CRIADA',
  RECEBIDA = 'RECEBIDA',
  FALHA = 'FALHA',
  FINALIZADO = 'FINALIZADO',
  DEVOLVIDO = 'DEVOLVIDO',
}

enum TransactionDebtsType {
  DEBIT_ONC_WALLET = 'DEBIT_ONC_WALLET',
  DEBIT_WITHDRAWAL = 'DEBIT_WITHDRAWAL',
}

class TransactionDebts {
  @ApiProperty()
  createdAt: string;

  @EnumUtil.ApiProperty(TransactionDebtsStatus)
  status: TransactionDebtsStatus;

  @EnumUtil.ApiProperty(TransactionDebtsType)
  type: TransactionDebtsType;

  @ApiProperty()
  value: number;
}

class TransactionDebtsSuccess {
  @ApiProperty()
  status: number;

  @ApiProperty({ type: [TransactionDebts] })
  body: ReadonlyArray<TransactionDebts>;
}

class TransactionCredit {
  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  indicatedName: string;

  @ApiProperty()
  originValue: number;

  @ApiProperty()
  value: number;
}

class TransactionCreditSuccess {
  @ApiProperty()
  status: number;

  @ApiProperty({ type: [TransactionCredit] })
  body: ReadonlyArray<TransactionCredit>;
}

class TransactionsTotal {
  @ApiProperty()
  realAmount: number;

  @ApiProperty()
  totalCommitted: number;

  @ApiProperty()
  totalGain: number;

  @ApiProperty()
  totalWithdrawn: number;
}

class TransactionsTotalSuccess {
  @ApiProperty()
  status: number;

  @ApiProperty()
  body: TransactionsTotal;
}

class TransactionsBalanceSuccess {
  @ApiProperty()
  status: number;

  @ApiProperty()
  body: number;
}

class IndicatedBody {
  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly participantId: string;
}

class Indicated {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly cpf: string;

  @ApiProperty()
  readonly createdAt: string;

  @ApiProperty()
  readonly updatedAt: string;

  @ApiProperty()
  readonly participantId: string;
}

class IndicatedSuccess {
  @ApiProperty()
  status: number;

  @ApiProperty()
  body: Indicated;
}

enum PixType {
  EMAIL = 'email',
  CPF = 'cpf',
  PHONE = 'phone',
  RANDOM_KEY = 'randomKey',
}

class TransactionDebitWithdrawalBody {
  @EnumUtil.ApiProperty(PixType)
  readonly pixType: PixType;

  @ApiProperty()
  readonly pixKey: string;

  @ApiProperty({ description: 'Value (in cents) for the given transaction', example: 123 })
  readonly value: number;
}

class TransactionDebitWithdrawal {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly value: number;

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

class TransactionDebitWithdrawalSuccess {
  @ApiProperty()
  status: number;

  @ApiProperty()
  body: TransactionDebitWithdrawal;
}

class TransactionDebitWithOncWalletBody {
  @ApiProperty({ description: 'Value (in cents) for the given transaction', example: 123 })
  readonly value: number;
}

class TransactionDebitWithOncWalletSuccess {
  @ApiProperty()
  status: number;

  @ApiProperty()
  body: string;
}

@ApiTags('Indique e Ganhe')
@Controller('indicate-and-earn-query')
export class IndicateAndEarnController {
  @Post('create-hash')
  @ApiOperation({ summary: 'Create hash link (Legacy)' })
  @ApiOkResponse({
    description: 'Link generate and executed successfully',
    type: CreateHashSuccess,
  })
  @ApiGoneResponse({ description: 'HashLink generated error', type: DefaultError })
  @ApiBearerAuth()
  @Roles([UserRoles.GUEST])
  createHash(): Promise<null> {
    return Promise.resolve(null);
  }

  @Get('transactions-debit')
  @ApiOperation({ summary: 'Get transactions debit (Legacy)' })
  @ApiOkResponse({ description: 'Get all debits transactions success', type: TransactionDebtsSuccess })
  @ApiGoneResponse({ description: 'Debits error', type: DefaultError })
  @ApiBearerAuth()
  @Roles([UserRoles.GUEST])
  getDebitTransactions(): Promise<null> {
    return Promise.resolve(null);
  }

  @Get('transactions-credit')
  @ApiOperation({ summary: 'Get transactions credit (Legacy)' })
  @ApiOkResponse({ description: 'Get all credit transactions success', type: TransactionCreditSuccess })
  @ApiGoneResponse({ description: 'Debits error', type: DefaultError })
  @ApiBearerAuth()
  @Roles([UserRoles.GUEST])
  getCreditTransactions(): Promise<null> {
    return Promise.resolve(null);
  }

  @Get('transactions-totals')
  @ApiOperation({ summary: 'Get transactions prices (Legacy)' })
  @ApiOkResponse({ description: 'Get all totals transactions success', type: TransactionsTotalSuccess })
  @ApiGoneResponse({ description: 'Transactions error', type: DefaultError })
  @ApiBearerAuth()
  @Roles([UserRoles.GUEST])
  getTotals(): Promise<null> {
    return Promise.resolve(null);
  }

  @Get('transactions-balance')
  @ApiOperation({ summary: 'Get transactions balance (Legacy)' })
  @ApiOkResponse({ description: 'Get all balance transactions success', type: TransactionsBalanceSuccess })
  @ApiGoneResponse({ description: 'Balance transactions error', type: DefaultError })
  @ApiBearerAuth()
  @Roles([UserRoles.GUEST])
  getBalance(): Promise<null> {
    return Promise.resolve(null);
  }

  @Post('indicated')
  @ApiOperation({ summary: 'Create an indicated (Legacy)' })
  @ApiOkResponse({ description: 'Create an indicated success', type: IndicatedSuccess })
  @ApiGoneResponse({ description: 'indicated error', type: DefaultError })
  @ApiBody({ type: IndicatedBody })
  @Roles([UserRoles.GUEST])
  createIndicated(): Promise<null> {
    return Promise.resolve(null);
  }

  @Post('transaction-debit-withdrawal')
  @ApiOperation({ summary: 'Create a transaction (Legacy)' })
  @ApiOkResponse({ description: 'Transaction success', type: TransactionDebitWithdrawalSuccess })
  @ApiGoneResponse({ description: 'Transaction error', type: DefaultError })
  @ApiBody({ type: TransactionDebitWithdrawalBody })
  @ApiBearerAuth()
  @Roles([UserRoles.GUEST])
  createTransactionDebitWithdrawal(): Promise<null> {
    return Promise.resolve(null);
  }

  @Post('transaction-debit-with-onc-wallet')
  @ApiOperation({ summary: 'Transaction debit for Olho no Carro wallet (Legacy)' })
  @ApiOkResponse({ description: 'Transaction success', type: TransactionDebitWithOncWalletSuccess })
  @ApiGoneResponse({ description: 'Transaction error', type: DefaultError })
  @ApiBody({ type: TransactionDebitWithOncWalletBody })
  @ApiBearerAuth()
  @Roles([UserRoles.GUEST])
  createTransactionDebitWithOncWallet(): Promise<null> {
    return Promise.resolve(null);
  }
}
