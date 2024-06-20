import { Test, TestingModule } from '@nestjs/testing';
import { SendOwnerReviewUseCase } from '../send-owner-review.use-case';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { MarkintingService } from 'src/domain/_layer/infrastructure/service/marketing.service';
import { OwnerReviewDto, CarOwnerReviewDto, OwnerDto } from 'src/domain/_layer/data/dto/owner-review.dto';
import { OwnerReviewNotProcess, ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';

describe(SendOwnerReviewUseCase.name, () => {
  let useCase: SendOwnerReviewUseCase;
  let mockOwnerReviewService: jest.Mocked<OwnerReviewService>;
  let mockMarketingService: jest.Mocked<MarkintingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendOwnerReviewUseCase,
        {
          provide: OwnerReviewService,
          useValue: {
            sendOwnerReview: jest.fn(),
          },
        },
        {
          provide: MarkintingService,
          useValue: {
            registerOwnerReview: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<SendOwnerReviewUseCase>(SendOwnerReviewUseCase);
    mockOwnerReviewService = module.get(OwnerReviewService);
    mockMarketingService = module.get(MarkintingService);
  });

  const ownerReviewMock: CarOwnerReviewDto = {
    user: { email: 'test@example.com', name: 'John Doe' } as OwnerDto,
    vehicle: { brandName: 'Toyota', modelName: 'Corolla' },
    review: { license_plate: 'ABC-1234', ranking: 5 },
  } as unknown as CarOwnerReviewDto;

  const ownerReviewDtoMock: OwnerReviewDto = {
    ranking: 5,
  } as unknown as OwnerReviewDto;

  it('should create owner review', async () => {
    mockOwnerReviewService.sendOwnerReview.mockResolvedValue(ownerReviewDtoMock);

    const result: OwnerReviewDto = await useCase.create(ownerReviewMock).unsafeRun();

    expect(result).toEqual(ownerReviewDtoMock);
    expect(mockOwnerReviewService.sendOwnerReview).toHaveBeenCalledWith(ownerReviewMock);
    expect(mockMarketingService.registerOwnerReview).toHaveBeenCalledWith({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      brand: 'Toyota',
      model: 'Corolla',
      plate: 'ABC-1234',
    });
  });

  it('should throw an error if owner review is not processed', async () => {
    const incompleteReview: OwnerReviewDto = { ...ownerReviewDtoMock, ranking: null } as OwnerReviewDto;
    mockOwnerReviewService.sendOwnerReview.mockResolvedValue(incompleteReview);

    await expect(useCase.create(ownerReviewMock).unsafeRun()).rejects.toThrow(OwnerReviewNotProcess);
  });

  it('should handle provider unavailable error', async () => {
    mockOwnerReviewService.sendOwnerReview.mockRejectedValue(new ProviderUnavailableDomainError());

    await expect(useCase.create(ownerReviewMock).unsafeRun()).rejects.toThrow(ProviderUnavailableDomainError);
  });
});
