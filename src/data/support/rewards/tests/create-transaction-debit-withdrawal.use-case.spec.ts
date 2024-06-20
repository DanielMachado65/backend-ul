import { IndicateAndEarnService } from 'src/domain/_layer/infrastructure/service/indicate-and-earn.service';
import { Test, TestingModule } from '@nestjs/testing';
import {
  PixType,
  TransactionDebitWithdrawalBodyInputDto,
} from 'src/domain/_layer/presentation/dto/transaction-debit-withdrawal-input.dto';
import { CreateTransactionDebitWithdrawalUseCase } from '../create-transaction-debit-withdrawal.use-case';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { PixKeyParserHelper } from '../pix-key-parser-helper';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import {
  TransactionDebitWithdrawal,
  TransactionDebtsStatus,
  TransactionDebtsType,
} from 'src/domain/_layer/data/dto/transaction-debit-withdrawal.dto';
import { v4 as uuidv4 } from 'uuid';

describe(CreateTransactionDebitWithdrawalUseCase.name, () => {
  let useCase: CreateTransactionDebitWithdrawalUseCase;
  let indicateAndEarnService: IndicateAndEarnService;
  let userRepository: UserRepository;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let pixKeyParserHelper: PixKeyParserHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionDebitWithdrawalUseCase,
        {
          provide: IndicateAndEarnService,
          useValue: { addTransactionDebitWithdrawal: jest.fn() },
        },
        {
          provide: UserRepository,
          useValue: { getById: jest.fn() },
        },
        PixKeyParserHelper,
      ],
    }).compile();

    useCase = module.get<CreateTransactionDebitWithdrawalUseCase>(CreateTransactionDebitWithdrawalUseCase);
    indicateAndEarnService = module.get<IndicateAndEarnService>(IndicateAndEarnService);
    userRepository = module.get<UserRepository>(UserRepository);
    pixKeyParserHelper = module.get<PixKeyParserHelper>(PixKeyParserHelper);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction debit and return formatted value', async () => {
      const userId: string = uuidv4();
      const dto: TransactionDebitWithdrawalBodyInputDto = {
        valueInCents: 15000,
        pixKey: '123.456.789-00',
        pixType: PixType.CPF,
      };

      jest.spyOn(indicateAndEarnService, 'addTransactionDebitWithdrawal').mockResolvedValue(true);
      jest.spyOn(userRepository, 'getById').mockResolvedValue({
        cpf: '123.456.789-00',
        email: 'test.user@example.com',
        id: userId,
        name: 'Test User',
      } as UserDto);

      const result: TransactionDebitWithdrawal = await useCase.create(userId, dto).unsafeRun();

      expect(result.status).toEqual(TransactionDebtsStatus.CRIADA);
      expect(result.type).toEqual(TransactionDebtsType.DEBIT_WITHDRAWAL);
      expect(result.valueInCents).toEqual(15000);
    });

    it('should throw an error when user is not found', async () => {
      const userId: string = uuidv4();
      const dto: TransactionDebitWithdrawalBodyInputDto = {
        valueInCents: 15000,
        pixKey: '123.456.789-00',
        pixType: PixType.CPF,
      };

      jest.spyOn(indicateAndEarnService, 'addTransactionDebitWithdrawal').mockResolvedValue(true);
      jest.spyOn(userRepository, 'getById').mockResolvedValue(null);

      await expect(useCase.create(userId, dto).unsafeRun()).rejects.toThrowError();
    });

    it('should throw an error when transaction debit fails', async () => {
      const userId: string = uuidv4();
      const dto: TransactionDebitWithdrawalBodyInputDto = {
        valueInCents: 15000,
        pixKey: '123.456.789-00',
        pixType: PixType.CPF,
      };

      jest.spyOn(indicateAndEarnService, 'addTransactionDebitWithdrawal').mockResolvedValue(false);
      jest.spyOn(userRepository, 'getById').mockResolvedValue({
        cpf: '123.456.789-00',
        email: 'test.user@example.com',
        id: userId,
        name: 'Test User',
      } as UserDto);

      await expect(useCase.create(userId, dto).unsafeRun()).rejects.toThrowError();
    });
  });
});
