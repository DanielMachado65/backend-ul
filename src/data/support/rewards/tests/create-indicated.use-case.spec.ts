import { Test, TestingModule } from '@nestjs/testing';
import { IndicateAndEarnService } from 'src/domain/_layer/infrastructure/service/indicate-and-earn.service';
import { CreateIndicatedUseCase } from '../create-indicated.use-case';
import { IndicatedInputDto } from 'src/domain/_layer/presentation/dto/indicated-input.dto';
import { IndicatedCoupon, IndicatedDto } from 'src/domain/_layer/data/dto/indicated.dto';
import { IndicatedNotProcessDomainError } from 'src/domain/_entity/result.error';

describe(CreateIndicatedUseCase.name, () => {
  let useCase: CreateIndicatedUseCase;
  let indicateAndEarnService: IndicateAndEarnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateIndicatedUseCase,
        {
          provide: IndicateAndEarnService,
          useValue: { addIndicated: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<CreateIndicatedUseCase>(CreateIndicatedUseCase);
    indicateAndEarnService = module.get<IndicateAndEarnService>(IndicateAndEarnService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction debit and return formatted value', async () => {
      const dto: IndicatedInputDto = { email: 'user@example.com', participantId: 'participant123' };

      const response: IndicatedDto = {
        participantId: dto.participantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        email: dto.email,
        id: 'indicated123',
        cpf: '123.456.789-00',
        name: 'User Example',
        coupon: IndicatedCoupon.INDICATED,
      };

      jest.spyOn(indicateAndEarnService, 'addIndicated').mockResolvedValue(response);

      const result: IndicatedDto = await useCase.create(dto).unsafeRun();

      expect(result.coupon).toEqual('INDICADO');
      expect(result.email).toEqual('user@example.com');
      expect(result.participantId).toEqual('participant123');
      expect(indicateAndEarnService.addIndicated).toHaveBeenCalledWith({
        email: dto.email,
        participantId: dto.participantId,
      });
    });

    it('should return an error if transaction debit fails', async () => {
      const dto: IndicatedInputDto = { email: 'user@example.com', participantId: 'participant123' };

      jest.spyOn(indicateAndEarnService, 'addIndicated').mockResolvedValue(null);

      const result: Promise<IndicatedDto> = useCase.create(dto).unsafeRun();
      await expect(result).rejects.toThrow(IndicatedNotProcessDomainError);
    });
  });
});
