import { Module, Provider } from '@nestjs/common';
import { CreateTransactionDebitsWithOncWalletDomain } from 'src/domain/support/rewards/create-transaction-debit-with-onc-wallet.domain';
import { CreateTransactionDebitWithOncWalletUseCase } from './create-transaction-debit-with-onc-wallet.use-case';
import { CreateIndicatedDomain } from 'src/domain/support/rewards/create-indicated.domain';
import { CreateIndicatedUseCase } from './create-indicated.use-case';
import { CreateTransactionDebitsWithdrawalDomain } from 'src/domain/support/rewards/create-transaction-debit-withdrawal.domain';
import { CreateTransactionDebitWithdrawalUseCase } from './create-transaction-debit-withdrawal.use-case';
import { PixKeyParserHelper } from './pix-key-parser-helper';
import { GetIndicateAndEarnFundsDomain } from 'src/domain/support/rewards/get-indicate-and-earn-funds.domain';
import { GetIndicateAndEarnFundsUseCase } from './get-indicate-and-earn-funds.use-case';
import { GetIndicateAndEarnDebitsHistoryDomain } from 'src/domain/support/rewards/get-indicate-and-earn-debts-history.domain';
import { GetIndicateAndEarnDebitsHistoryUseCase } from './get-indicate-and-earn-debts-history.use-case';
import { GetIndicateAndEarnHashlinkDomain } from 'src/domain/support/rewards/get-indicate-and-earn-hashlink.domain';
import { GetIndicateAndEarnHashlinkUseCase } from './get-indicate-and-earn-hashlink.use-case';
import { GetTransactionCreditDomain } from 'src/domain/support/rewards/get-transaction-credit.domain';
import { GetTransactionCreditUseCase } from './get-transaction-credit.use-case';

const providers: ReadonlyArray<Provider> = [
  PixKeyParserHelper,
  {
    provide: CreateTransactionDebitsWithOncWalletDomain,
    useClass: CreateTransactionDebitWithOncWalletUseCase,
  },
  {
    provide: CreateIndicatedDomain,
    useClass: CreateIndicatedUseCase,
  },
  {
    provide: CreateTransactionDebitsWithdrawalDomain,
    useClass: CreateTransactionDebitWithdrawalUseCase,
  },
  { provide: GetIndicateAndEarnFundsDomain, useClass: GetIndicateAndEarnFundsUseCase },
  { provide: GetIndicateAndEarnDebitsHistoryDomain, useClass: GetIndicateAndEarnDebitsHistoryUseCase },
  { provide: GetIndicateAndEarnHashlinkDomain, useClass: GetIndicateAndEarnHashlinkUseCase },
  { provide: GetTransactionCreditDomain, useClass: GetTransactionCreditUseCase },
];

@Module({
  imports: [],
  controllers: [],
  providers: [...providers],
  exports: [...providers],
})
export class RewardsDataLayerModule {}
