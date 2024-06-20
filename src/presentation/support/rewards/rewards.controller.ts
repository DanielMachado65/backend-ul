import { Body, Controller, Post, Get } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { Roles } from '../../../infrastructure/guard/roles.guard';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';
import { TransactionDebitWithOncWalletSuccess } from 'src/domain/_layer/presentation/dto/transaction-debit-with-onc-wallet-output.dto';
import {
  CreateTransactionDebitsWithOncWalletDomain,
  CreateTransactionDebitsWithOncWalletsResult,
} from 'src/domain/support/rewards/create-transaction-debit-with-onc-wallet.domain';
import { UserInfo } from 'src/infrastructure/middleware/user-info.middleware';
import { TransactionDebitWithOncWalletBodyDto } from 'src/domain/_layer/presentation/dto/transaction-debit-with-onc-wallet-input.dto';
import { ApiErrorResponseMake, ApiOkResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import {
  IndicatedNotProcessDomainError,
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { IndicatedInputDto } from 'src/domain/_layer/presentation/dto/indicated-input.dto';
import { CreateIndicatedDomain, CreateIndicateResult } from 'src/domain/support/rewards/create-indicated.domain';
import { IndicatedDto } from 'src/domain/_layer/data/dto/indicated.dto';
import { TransactionDebitWithdrawalBodyInputDto } from 'src/domain/_layer/presentation/dto/transaction-debit-withdrawal-input.dto';
import {
  CreateTransactionDebitWithdrawalResult,
  CreateTransactionDebitsWithdrawalDomain,
} from 'src/domain/support/rewards/create-transaction-debit-withdrawal.domain';
import {
  GetIndicateAndEarnFundsDomain,
  GetIndicateAndEarnFundsResult,
} from 'src/domain/support/rewards/get-indicate-and-earn-funds.domain';
import { IndicateAndEarnFundsDto } from 'src/domain/_layer/presentation/dto/indicate-and-earn-funds.dto';
import { IndicateAndEarnInstanceDebit } from 'src/domain/_layer/presentation/dto/indicate-and-earn-history-debts.dto';
import { ApiList } from 'src/infrastructure/framework/swagger/schemas/list.schema';
import {
  GetIndicateAndEarnDebitsHistoryDomain,
  GetIndicateAndEarnDebitsHistoryResult,
} from 'src/domain/support/rewards/get-indicate-and-earn-debts-history.domain';
import {
  GetIndicateAndEarnHashlinkDomain,
  GetIndicateAndEarnHashlinkResult,
} from 'src/domain/support/rewards/get-indicate-and-earn-hashlink.domain';
import { TransactionCredit } from 'src/domain/_layer/data/dto/transaction-credit.dto';
import {
  GetTransactionCreditDomain,
  GetTransactionCreditResult,
} from 'src/domain/support/rewards/get-transaction-credit.domain';
import { TransactionDebitWithdrawal } from 'src/domain/_layer/data/dto/transaction-debit-withdrawal.dto';

@ApiTags('Indique e Ganhe')
@Controller('indicate-and-earn')
export class RewardsController {
  constructor(
    private readonly _createTransactionDebit: CreateTransactionDebitsWithOncWalletDomain,
    private readonly _createIndicated: CreateIndicatedDomain,
    private readonly _createTransactionDebitWithdrawal: CreateTransactionDebitsWithdrawalDomain,
    private readonly _getIndicateAndEarnFundsDomain: GetIndicateAndEarnFundsDomain,
    private readonly _getIndicateAndEarnDebitsHistoryDomain: GetIndicateAndEarnDebitsHistoryDomain,
    private readonly _getIndicateAndEarnHashlinkDomain: GetIndicateAndEarnHashlinkDomain,
    private readonly _getTransactionCreditDomain: GetTransactionCreditDomain,
  ) {}

  @Post('transaction/debit-with-onc-wallet')
  @ApiOperation({ summary: 'Transaction debit for Olho no Carro wallet' })
  @ApiOkResponseMake(TransactionDebitWithOncWalletSuccess)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  @ApiBearerAuth()
  @Roles([UserRoles.REGULAR])
  async createTransactionDebitWithOncWallet(
    @UserInfo() userInfo: UserInfo,
    @Body() body: TransactionDebitWithOncWalletBodyDto,
  ): Promise<CreateTransactionDebitsWithOncWalletsResult> {
    return this._createTransactionDebit.create(userInfo.maybeUserId, body).safeRun();
  }

  @Post('transaction/debit-withdrawal')
  @ApiOperation({ summary: 'Create a debit transaction' })
  @ApiOkResponseMake(TransactionDebitWithdrawal)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError, NoUserFoundDomainError])
  @ApiBody({ type: TransactionDebitWithOncWalletBodyDto })
  @ApiBearerAuth()
  @Roles([UserRoles.REGULAR])
  createTransactionDebitWithdrawal(
    @UserInfo() userInfo: UserInfo,
    @Body() body: TransactionDebitWithdrawalBodyInputDto,
  ): Promise<CreateTransactionDebitWithdrawalResult> {
    return this._createTransactionDebitWithdrawal.create(userInfo.maybeUserId, body).safeRun();
  }

  @Post('indicate')
  @ApiOperation({ summary: 'Create an indicated' })
  @ApiOkResponseMake(IndicatedDto, { description: 'Create an indicated success' })
  @ApiErrorResponseMake([UnknownDomainError, IndicatedNotProcessDomainError])
  @Roles([UserRoles.GUEST])
  createIndicated(@Body() body: IndicatedInputDto): Promise<CreateIndicateResult> {
    return this._createIndicated.create(body).safeRun();
  }

  @Get('account-stats')
  @ApiOperation({ summary: 'Get account stats' })
  @ApiOkResponseMake(IndicateAndEarnFundsDto)
  @ApiErrorResponseMake([ProviderUnavailableDomainError])
  @ApiBearerAuth()
  @Roles([UserRoles.REGULAR])
  getTotals(@UserInfo() userInfo: UserInfo): Promise<GetIndicateAndEarnFundsResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getIndicateAndEarnFundsDomain.getFunds(userId).safeRun();
  }

  @Get('debit-transactions')
  @ApiOperation({ summary: 'Get transactions debit' })
  @ApiOkResponseMake(ApiList(IndicateAndEarnInstanceDebit))
  @ApiErrorResponseMake([ProviderUnavailableDomainError])
  @ApiBearerAuth()
  @Roles([UserRoles.REGULAR])
  getDebitTransactions(@UserInfo() userInfo: UserInfo): Promise<GetIndicateAndEarnDebitsHistoryResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getIndicateAndEarnDebitsHistoryDomain.getDebitsHistory(userId).safeRun();
  }

  @Post('create-hash')
  @ApiOperation({ summary: 'Create hash link' })
  @ApiOkResponseMake(String)
  @ApiErrorResponseMake([NoUserFoundDomainError, ProviderUnavailableDomainError])
  @ApiBearerAuth()
  @Roles([UserRoles.REGULAR])
  createHash(@UserInfo() userInfo: UserInfo): Promise<GetIndicateAndEarnHashlinkResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getIndicateAndEarnHashlinkDomain.getLink(userId).safeRun();
  }

  @Get('transactions-credit')
  @ApiOperation({ summary: 'Get transactions credit' })
  @ApiOkResponseMake(ApiList(TransactionCredit))
  @ApiErrorResponseMake([ProviderUnavailableDomainError])
  @ApiBearerAuth()
  @Roles([UserRoles.REGULAR])
  getCreditTransactions(@UserInfo() userInfo: UserInfo): Promise<GetTransactionCreditResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getTransactionCreditDomain.getTransactionCredit(userId).safeRun();
  }
}
