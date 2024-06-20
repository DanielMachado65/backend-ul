import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Test, TestingModule } from '@nestjs/testing';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { TransactionDebitWithOncWalletSuccess } from 'src/domain/_layer/presentation/dto/transaction-debit-with-onc-wallet-output.dto';
import { TransactionDebitWithOncWalletBodyDto } from 'src/domain/_layer/presentation/dto/transaction-debit-with-onc-wallet-input.dto';
import {
  CreateTransactionDebitWithdrawalIO,
  CreateTransactionDebitsdrawalDomainErrors,
  CreateTransactionDebitsWithdrawalDomain,
  CreateTransactionDebitWithdrawalResult,
} from 'src/domain/support/rewards/create-transaction-debit-withdrawal.domain';
import {
  CreateTransactionDebitsWithOncWalletDomain,
  CreateTransactionDebitsWithOncWalletsIO,
  CreateTransactionDebitsWithOncWalletsResult,
} from 'src/domain/support/rewards/create-transaction-debit-with-onc-wallet.domain';
import { UserInfo } from 'src/infrastructure/middleware/user-info.middleware';
import { RewardsController } from 'src/presentation/support/rewards/rewards.controller';
import {
  CreateIndicatedDomain,
  CreateIndicateIO,
  CreateIndicateResult,
} from 'src/domain/support/rewards/create-indicated.domain';
import { IndicatedInputDto } from 'src/domain/_layer/presentation/dto/indicated-input.dto';
import { IndicatedDto } from 'src/domain/_layer/data/dto/indicated.dto';
import {
  PixType,
  TransactionDebitWithdrawalBodyInputDto,
} from 'src/domain/_layer/presentation/dto/transaction-debit-withdrawal-input.dto';
import {
  GetIndicateAndEarnFundsDomain,
  GetIndicateAndEarnFundsIO,
} from 'src/domain/support/rewards/get-indicate-and-earn-funds.domain';
import {
  GetIndicateAndEarnHashlinkDomain,
  GetIndicateAndEarnHashlinkIO,
} from 'src/domain/support/rewards/get-indicate-and-earn-hashlink.domain';
import { IndicateAndEarnFundsDto } from 'src/domain/_layer/presentation/dto/indicate-and-earn-funds.dto';
import { IndicateAndEarnInstanceDebit } from 'src/domain/_layer/presentation/dto/indicate-and-earn-history-debts.dto';
import {
  GetIndicateAndEarnDebitsHistoryDomain,
  GetIndicateAndEarnDebitsHistoryIO,
} from 'src/domain/support/rewards/get-indicate-and-earn-debts-history.domain';
import {
  GetTransactionCreditDomain,
  GetTransactionCreditIO,
} from 'src/domain/support/rewards/get-transaction-credit.domain';
import { TransactionDebitWithdrawal } from 'src/domain/_layer/data/dto/transaction-debit-withdrawal.dto';
import { TransactionCreditOutput } from 'src/domain/_layer/presentation/dto/transaction-credit-output.dto';

describe('IndicateAndEarnController', () => {
  let sut: RewardsController;
  let module: TestingModule;
  let createTransactionDebit: CreateTransactionDebitsWithOncWalletDomain;
  let createIndicated: CreateIndicatedDomain;
  let createTransactionDebitWithdrawal: CreateTransactionDebitsWithdrawalDomain;
  let getIndicateAndEarnFunds: GetIndicateAndEarnFundsDomain;
  let getIndicateAndEarnDebitsHistory: GetIndicateAndEarnDebitsHistoryDomain;
  let getIndicateAndEarnHashlink: GetIndicateAndEarnHashlinkDomain;
  let getTransactionCredit: GetTransactionCreditDomain;

  const userInfo: UserInfo = {
    maybeUserId: 'user-id',
    maybeToken: 'any_token',
    roles: [],
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [RewardsController],
      providers: [
        {
          provide: CreateTransactionDebitsWithOncWalletDomain,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: CreateIndicatedDomain,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: CreateTransactionDebitsWithdrawalDomain,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: GetIndicateAndEarnFundsDomain,
          useValue: {
            getFunds: jest.fn(),
          },
        },
        {
          provide: GetIndicateAndEarnDebitsHistoryDomain,
          useValue: {
            getDebitsHistory: jest.fn(),
          },
        },
        {
          provide: GetIndicateAndEarnHashlinkDomain,
          useValue: {
            getLink: jest.fn(),
          },
        },
        {
          provide: GetTransactionCreditDomain,
          useValue: {
            getTransactionCredit: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = module.get<RewardsController>(RewardsController);
    createTransactionDebit = module.get<CreateTransactionDebitsWithOncWalletDomain>(
      CreateTransactionDebitsWithOncWalletDomain,
    );
    createIndicated = module.get<CreateIndicatedDomain>(CreateIndicatedDomain);
    createTransactionDebitWithdrawal = module.get<CreateTransactionDebitsWithdrawalDomain>(
      CreateTransactionDebitsWithdrawalDomain,
    );
    getIndicateAndEarnFunds = module.get<GetIndicateAndEarnFundsDomain>(GetIndicateAndEarnFundsDomain);
    getIndicateAndEarnDebitsHistory = module.get<GetIndicateAndEarnDebitsHistoryDomain>(
      GetIndicateAndEarnDebitsHistoryDomain,
    );
    getIndicateAndEarnHashlink = module.get<GetIndicateAndEarnHashlinkDomain>(GetIndicateAndEarnHashlinkDomain);
    getTransactionCredit = module.get<GetTransactionCreditDomain>(GetTransactionCreditDomain);
  });

  describe('#createTransactionDebitWithOncWallet', () => {
    it('should call create with the correct parameters and return success response', async () => {
      const userInfo: UserInfo = {
        maybeUserId: 'user-id',
        maybeToken: 'any_token',
        roles: [],
      };
      const body: TransactionDebitWithOncWalletBodyDto = { valueInCents: 123 };
      const expectedResult: TransactionDebitWithOncWalletSuccess = { valueInCents: 123 };

      const eitherResult: CreateTransactionDebitsWithOncWalletsIO = EitherIO.of<
        UnknownDomainError,
        TransactionDebitWithOncWalletSuccess
      >(UnknownDomainError.toFn(), expectedResult);

      jest.spyOn(createTransactionDebit, 'create').mockReturnValue(eitherResult);

      const result: CreateTransactionDebitsWithOncWalletsResult = await sut.createTransactionDebitWithOncWallet(
        userInfo,
        body,
      );

      expect(createTransactionDebit.create).toHaveBeenCalledWith(userInfo.maybeUserId, body);
      expect(result.getRight()).toEqual(expectedResult);
    });
  });

  describe('#createTransactionDebitWithdrawal', () => {
    it('should return null', async () => {
      const body: TransactionDebitWithdrawalBodyInputDto = {
        valueInCents: 123,
        pixKey: '123',
        pixType: PixType.CPF,
      };
      const expectedResult: TransactionDebitWithdrawal = {
        createdAt: '2021-09-01T00:00:00Z',
        id: '123',
        indicatedCpf: '12345678909',
        indicatedEmail: 'teste@gmail.com',
        indicatedId: '123',
        indicatedName: 'Teste',
        originValue: 123,
        participantId: '123',
        status: 'CRIADA',
        type: 'DEBIT_WITHDRAWAL',
        updatedAt: '2021-09-01T00:00:00Z',
        valueInCents: 123,
      };
      const eitherResult: CreateTransactionDebitWithdrawalIO = EitherIO.of<
        CreateTransactionDebitsdrawalDomainErrors,
        TransactionDebitWithdrawal
      >(UnknownDomainError.toFn(), expectedResult);

      jest.spyOn(createTransactionDebitWithdrawal, 'create').mockReturnValue(eitherResult);

      const result: CreateTransactionDebitWithdrawalResult = await sut.createTransactionDebitWithdrawal(userInfo, body);

      expect(createTransactionDebitWithdrawal.create).toHaveBeenCalledWith(userInfo.maybeUserId, body);
      expect(result.getRight()).toEqual(expectedResult);
    });
  });

  describe('#createIndicated', () => {
    it('should call create with the correct parameters and return success response', async () => {
      const body: IndicatedInputDto = { email: 'teste@gmail.com', participantId: '123' };

      const eitherResult: CreateIndicateIO = EitherIO.of<UnknownDomainError, IndicatedDto>(UnknownDomainError.toFn(), {
        cpf: '123',
        email: 'teste@gmail.com',
      } as IndicatedDto);

      jest.spyOn(createIndicated, 'create').mockReturnValue(eitherResult);

      const result: CreateIndicateResult = await sut.createIndicated(body);

      expect(createIndicated.create).toHaveBeenCalledWith(body);
      expect(result.getRight()).toEqual({
        cpf: '123',
        email: 'teste@gmail.com',
      });
    });
  });

  describe('#createTransactionDebitWithdrawal', () => {
    it('should return null', async () => {
      const body: TransactionDebitWithdrawalBodyInputDto = {
        valueInCents: 123,
        pixKey: '123',
        pixType: PixType.CPF,
      };
      const expectedResult: TransactionDebitWithdrawal = {
        createdAt: '2021-09-01T00:00:00Z',
        id: '123',
        indicatedCpf: '12345678909',
        indicatedEmail: 'teste@gmail.com',
        indicatedId: '123',
        indicatedName: 'Teste',
        originValue: 123,
        participantId: '123',
        status: 'CRIADA',
        type: 'DEBIT_WITHDRAWAL',
        updatedAt: '2021-09-01T00:00:00Z',
        valueInCents: 123,
      };
      const eitherResult: CreateTransactionDebitWithdrawalIO = EitherIO.of<
        CreateTransactionDebitsdrawalDomainErrors,
        TransactionDebitWithdrawal
      >(UnknownDomainError.toFn(), expectedResult);

      jest.spyOn(createTransactionDebitWithdrawal, 'create').mockReturnValue(eitherResult);

      const result: CreateTransactionDebitWithdrawalResult = await sut.createTransactionDebitWithdrawal(userInfo, body);

      expect(createTransactionDebitWithdrawal.create).toHaveBeenCalledWith(userInfo.maybeUserId, body);
      expect(result.getRight()).toEqual(expectedResult);
    });
  });

  describe('#GetIndicateAndEarnFunds', () => {
    it('should call create with the correct parameters and return success response', async () => {
      const userInfo: UserInfo = {
        maybeUserId: 'user-id',
        maybeToken: 'any_token',
        roles: [],
      };
      const expectedResult: IndicateAndEarnFundsDto = {
        realAmountInCents: 0,
        totalCommittedInCents: 0,
        totalGainInCents: 0,
        totalWithdrawnInCents: 0,
      };

      const eitherResult: GetIndicateAndEarnFundsIO = EitherIO.of(UnknownDomainError.toFn(), expectedResult);

      jest.spyOn(getIndicateAndEarnFunds, 'getFunds').mockReturnValue(eitherResult);

      const result: IndicateAndEarnFundsDto = (await sut.getTotals(userInfo)).getRight();

      expect(getIndicateAndEarnFunds.getFunds).toHaveBeenCalledWith(userInfo.maybeUserId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('#GetIndicateAndEarnDebitsHistory', () => {
    it('should call create with the correct parameters and return success response', async () => {
      const userInfo: UserInfo = {
        maybeUserId: 'user-id',
        maybeToken: 'any_token',
        roles: [],
      };
      const expectedResult: IndicateAndEarnInstanceDebit[] = [];

      const eitherResult: GetIndicateAndEarnDebitsHistoryIO = EitherIO.of(UnknownDomainError.toFn(), expectedResult);

      jest.spyOn(getIndicateAndEarnDebitsHistory, 'getDebitsHistory').mockReturnValue(eitherResult);

      const result: IndicateAndEarnInstanceDebit[] = (await sut.getDebitTransactions(userInfo)).getRight();

      expect(getIndicateAndEarnDebitsHistory.getDebitsHistory).toHaveBeenCalledWith(userInfo.maybeUserId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('#GetIndicateAndEarnHashlink', () => {
    it('should call create with the correct parameters and return success response', async () => {
      const userInfo: UserInfo = {
        maybeUserId: 'user-id',
        maybeToken: 'any_token',
        roles: [],
      };
      const expectedResult: string = '';

      const eitherResult: GetIndicateAndEarnHashlinkIO = EitherIO.of(UnknownDomainError.toFn(), expectedResult);

      jest.spyOn(getIndicateAndEarnHashlink, 'getLink').mockReturnValue(eitherResult);

      const result: string = (await sut.createHash(userInfo)).getRight();

      expect(getIndicateAndEarnHashlink.getLink).toHaveBeenCalledWith(userInfo.maybeUserId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('#GetTransactionCredit', () => {
    it('should call create with the correct parameters and return success response', async () => {
      const expectedResult: ReadonlyArray<TransactionCreditOutput> = [
        {
          createdAt: '2021-09-01T00:00:00Z',
          indicatedName: 'Teste',
          originValueInCents: 123,
          valueInCents: 123,
        },
      ];

      const eitherResult: GetTransactionCreditIO = EitherIO.of(UnknownDomainError.toFn(), expectedResult);

      jest.spyOn(getTransactionCredit, 'getTransactionCredit').mockReturnValue(eitherResult);
      const result: ReadonlyArray<TransactionCreditOutput> = (await sut.getCreditTransactions(userInfo)).getRight();

      expect(getTransactionCredit.getTransactionCredit).toHaveBeenCalledWith(userInfo.maybeUserId);
      expect(result).toEqual(expectedResult);
    });
  });
});
