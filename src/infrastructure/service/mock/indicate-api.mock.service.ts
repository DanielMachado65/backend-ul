import { IndicateAndEarnFundsDto } from 'src/domain/_layer/presentation/dto/indicate-and-earn-funds.dto';
import {
  HashLinkParams,
  IndicateAndEarnService,
  TransactionCreditsDto,
  TransactionDebitsWithdrawalDto,
  TransactionDebitsWithOncWalletDto,
  TransactionsDebit,
} from '../../../domain/_layer/infrastructure/service/indicate-and-earn.service';
import { Injectable } from '@nestjs/common';
import { TransactionCredit } from 'src/domain/_layer/data/dto/transaction-credit.dto';
import { IndicatedDto } from 'src/domain/_layer/data/dto/indicated.dto';

@Injectable()
export class IndicateApiMockService implements IndicateAndEarnService {
  getHashLink(_params: HashLinkParams): Promise<string> {
    throw new Error('Method not implemented.');
  }

  getTransactionsDebits(_userId: string): Promise<TransactionsDebit[]> {
    throw new Error('Method not implemented.');
  }

  addTransactionCredit(_transactionCreditsDto: TransactionCreditsDto): Promise<void> {
    return Promise.resolve(undefined);
  }

  addTransactionDebitWithOncWallet(_dto: TransactionDebitsWithOncWalletDto): Promise<boolean> {
    return Promise.resolve(true);
  }

  addIndicated(_dto: { email: string; participantId: string }): Promise<IndicatedDto> {
    return Promise.resolve(null);
  }

  addTransactionDebitWithdrawal(_dto: TransactionDebitsWithdrawalDto): Promise<boolean> {
    return Promise.resolve(true);
  }
  getTransactionsTotals(_userId: string): Promise<IndicateAndEarnFundsDto> {
    throw new Error('Method not implemented.');
  }
  getTransactionCredit(_userId: string): Promise<TransactionCredit[]> {
    throw new Error('Method not implemented.');
  }
}
