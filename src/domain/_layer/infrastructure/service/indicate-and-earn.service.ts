import { IndicatedDto } from '../../data/dto/indicated.dto';
import { TransactionCredit } from '../../data/dto/transaction-credit.dto';
import { IndicateAndEarnFundsDto } from '../../presentation/dto/indicate-and-earn-funds.dto';

export type TransactionCreditsDto = {
  indicatedId: string;
  indicatedName: string;
  indicatedCpf: string;
  indicatedEmail: string;
  originValueInCents: number;
};

export type TransactionDebitsWithdrawalDto = {
  cpf: string;
  email: string;
  name: string;
  originId: string;
  pixKeyType: string;
  pixKey: string;
  value: number;
};

export class TransactionDebitsWithOncWalletDto {
  userId: string;
  valueInCents: number;
}

// incomplete
export type TransactionsDebit = {
  createdAt: string;
  status: 'CRIADA' | 'RECEBIDA' | 'FALHA' | 'FINALIZADO' | 'DEVOLVIDO';
  type: 'CREDIT' | 'DEBIT_WITHDRAWAL' | 'DEBIT_ONC_WALLET';
  value: number;
};

export type HashLinkParams = {
  cpf: string;
  email: string;
  originId: string;
  name: string;
};

export abstract class IndicateAndEarnService {
  abstract getTransactionsTotals(userId: string): Promise<IndicateAndEarnFundsDto>;
  abstract addTransactionCredit(transactionCreditsDto: TransactionCreditsDto): Promise<void>;
  abstract addTransactionDebitWithOncWallet(dto: TransactionDebitsWithOncWalletDto): Promise<boolean>;
  abstract addIndicated({ email, participantId }: Partial<IndicatedDto>): Promise<IndicatedDto>;
  abstract addTransactionDebitWithdrawal(dto: TransactionDebitsWithdrawalDto): Promise<boolean>;
  abstract getTransactionsDebits(userId: string): Promise<TransactionsDebit[]>;
  abstract getHashLink(params: HashLinkParams): Promise<string>;
  abstract getTransactionCredit(userId: string): Promise<TransactionCredit[]>;
}
