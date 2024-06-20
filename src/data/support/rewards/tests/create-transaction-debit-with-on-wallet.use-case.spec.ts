import { Test, TestingModule } from '@nestjs/testing';
import { IndicateAndEarnService } from 'src/domain/_layer/infrastructure/service/indicate-and-earn.service';
import { CreateTransactionDebitWithOncWalletUseCase } from '../create-transaction-debit-with-onc-wallet.use-case';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { TransactionDebitWithOncWalletBodyDto } from 'src/domain/_layer/presentation/dto/transaction-debit-with-onc-wallet-input.dto';
import { TransactionDebitWithOncWalletSuccess } from 'src/domain/_layer/presentation/dto/transaction-debit-with-onc-wallet-output.dto';
import { EVENT_EMITTER_SERVICE } from 'src/domain/_layer/infrastructure/service/event/event.service';

describe('CreateTransactionDebitWithOncWalletUseCase', () => {
  let useCase: CreateTransactionDebitWithOncWalletUseCase;
  let indicateAndEarnService: IndicateAndEarnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionDebitWithOncWalletUseCase,
        {
          provide: IndicateAndEarnService,
          useValue: { addTransactionDebitWithOncWallet: jest.fn() },
        },
        { provide: EVENT_EMITTER_SERVICE, useValue: {} },
      ],
    }).compile();

    useCase = module.get<CreateTransactionDebitWithOncWalletUseCase>(CreateTransactionDebitWithOncWalletUseCase);
    indicateAndEarnService = module.get<IndicateAndEarnService>(IndicateAndEarnService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction debit and return formatted value', async () => {
      const userId: string = 'user123';
      const dto: TransactionDebitWithOncWalletBodyDto = { valueInCents: 100 };

      jest.spyOn(indicateAndEarnService, 'addTransactionDebitWithOncWallet').mockResolvedValue(true);

      const result: TransactionDebitWithOncWalletSuccess = await useCase.create(userId, dto).unsafeRun();

      expect(result.valueInCents).toEqual(100);
      expect(indicateAndEarnService.addTransactionDebitWithOncWallet).toHaveBeenCalledWith({
        userId,
        valueInCents: 100,
      });
    });

    it('should return an error if transaction debit fails', async () => {
      const userId: string = 'user123';
      const dto: TransactionDebitWithOncWalletBodyDto = { valueInCents: 100 };

      jest.spyOn(indicateAndEarnService, 'addTransactionDebitWithOncWallet').mockResolvedValue(false);

      const result: Promise<TransactionDebitWithOncWalletSuccess> = useCase.create(userId, dto).unsafeRun();

      await expect(result).rejects.toThrow(ProviderUnavailableDomainError);
    });
  });
});
