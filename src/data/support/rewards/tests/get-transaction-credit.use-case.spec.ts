import { IndicateAndEarnService } from 'src/domain/_layer/infrastructure/service/indicate-and-earn.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionCreditUseCase } from '../get-transaction-credit.use-case';
import { TransactionCredit } from 'src/domain/_layer/data/dto/transaction-credit.dto';
import { v4 } from 'uuid';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { TransactionCreditOutputDto } from 'src/domain/_layer/presentation/dto/transaction-credit-output.dto';

describe(GetTransactionCreditUseCase.name, () => {
  let useCase: GetTransactionCreditUseCase;
  let indicateAndEarnService: IndicateAndEarnService;
  const userId: string = v4();

  const generateTransactionCredit = (): TransactionCredit => ({
    createdAt: new Date().toISOString(),
    indicatedName: 'indicatedName',
    originValueInCents: 100,
    valueInCents: 100,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionCreditUseCase,
        {
          provide: IndicateAndEarnService,
          useValue: {
            addTransactionDebitWithdrawal: jest.fn(),
            getTransactionCredit: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetTransactionCreditUseCase>(GetTransactionCreditUseCase);
    indicateAndEarnService = module.get<IndicateAndEarnService>(IndicateAndEarnService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('getTransactionCredit', () => {
    it('should return formatted transaction credits', async () => {
      jest.spyOn(indicateAndEarnService, 'getTransactionCredit').mockResolvedValue([generateTransactionCredit()]);

      const result: TransactionCreditOutputDto = await useCase.getTransactionCredit(userId).unsafeRun();

      expect(result).toEqual([
        {
          createdAt: expect.any(String),
          indicatedName: 'indicatedName',
          originValueInCents: 100,
          valueInCents: 100,
        },
      ]);
    });

    it('should throw an error when the service fails', async () => {
      jest
        .spyOn(indicateAndEarnService, 'getTransactionCredit')
        .mockRejectedValue(new ProviderUnavailableDomainError());

      await expect(useCase.getTransactionCredit(userId).unsafeRun()).rejects.toThrow(ProviderUnavailableDomainError);
    });
  });
});
