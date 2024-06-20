import { Test, TestingModule } from '@nestjs/testing';
import { MyCarsQueryHelper } from 'src/data/core/product/my-cars-query.helper';
import { QueryOwnerReviewUseCase } from 'src/data/core/product/query-owner-review.use-case';
import { MyCarProductStatusEnum } from 'src/domain/_entity/my-car-product.entity';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  ProviderUnavailableDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { FullPaginatedReviewsDto, OwnerReviewFullDto, RankingDto } from 'src/domain/_layer/data/dto/owner-review.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { MyCarQueryOwnerReview } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { QueryOwnerReviewDomain } from 'src/domain/core/product/query-owner-review.domain';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';

describe('QueryOwnerReviewUseCase', () => {
  let sut: QueryOwnerReviewDomain;
  let module: TestingModule;
  let myCarProductRepository: MyCarProductRepository;
  let ownerReviewService: OwnerReviewService;

  const userId: string = 'any_user_id';
  const carId: string = 'any_car_id';

  const carProductMock: Partial<MyCarProductWithUserDto> = {
    status: MyCarProductStatusEnum.ACTIVE,
    keys: {
      brand: 'any_brand',
      brandModelCode: 'any_brand_model_code',
      chassis: 'any_chassis',
      engineNumber: 'any_engine_power',
      engineCapacity: 'any_engine_capacity',
      fipeId: '50628',
      fipeName: 'any_fipe_name',
      model: 'any_model',
      modelYear: 2021,
      plate: 'ABC1234',
      versionId: 'any_version_id',
      zipCode: 'any_zip_code',
    },
    email: 'any_email',
    name: 'any_name',
    carId: 'any_car_id',
    userId: 'any_user_id',
  };

  const generalReviewMock: RankingDto = {
    comfort: 8.0,
    cambium: 8.4,
    cityConsumption: 9.0,
    roadConsumption: 8.9,
    performance: 8.4,
    drivability: 9.1,
    internalSpace: 8.1,
    stability: 8.6,
    brakes: 9.1,
    trunk: 7.8,
    suspension: 8.0,
    costBenefit: 8.8,
    totalScore: 8.5,
  };

  const paginatedReviewsMock: FullPaginatedReviewsDto = {
    amountInThisPage: 1,
    count: 1,
    currentPage: 1,
    itemsPerPage: 10,
    nextPage: null,
    previousPage: null,
    totalPages: 1,
    items: [
      {
        id: 'any_id',
        averageScore: 7.8307692307692305,
        strengths: '',
        cons: '',
        flaws: '',
        generalFeedback: '',
        km: 150000,
        createdAt: '2023-08-04T14:32:59.880Z',
        brand: { name: 'any_brand' },
        model: { name: 'any_model', code: 'any_code' },
        version: { year: 2004, fipeId: '250619' },
        owner: {
          name: 'User X',
        },
        ranking: {
          comfort: 7,
          cambium: 8,
          cityConsumption: 9,
          roadConsumption: 9,
          performance: 9,
          drivability: 8,
          internalSpace: 8,
          stability: 8,
          brakes: 8,
          trunk: 7,
          suspension: 6,
          costBenefit: 7,
          totalScore: 7.8,
        },
        engagement: {
          likes: 0,
          dislikes: 0,
        },
      },
    ],
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        MyCarsQueryHelper,
        CurrencyUtil,
        {
          provide: QueryOwnerReviewDomain,
          useClass: QueryOwnerReviewUseCase,
        },
        {
          provide: MyCarProductRepository,
          useValue: {
            getByUserIdAndCarId: jest.fn(),
          },
        },
        {
          provide: QueryRequestService,
          useValue: {
            requestQuery: jest.fn(),
            getAsyncQueryByReference: jest.fn(),
          },
        },
        {
          provide: OwnerReviewService,
          useValue: {
            getReviewByFipeId: jest.fn(),
            listPaginatedByVersion: jest.fn(),
          },
        },
      ],
    }).compile();

    myCarProductRepository = module.get(MyCarProductRepository);
    ownerReviewService = module.get(OwnerReviewService);
  });

  beforeEach(async () => {
    sut = await module.resolve(QueryOwnerReviewDomain);
  });

  describe('#execute', () => {
    test('should call execute and return CarNotFoundError error', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce(null);

      const promise: Promise<MyCarQueryOwnerReview> = sut.execute(userId, carId).unsafeRun();

      expect(promise).rejects.toThrow(CarNotFoundError);
      expect(ownerReviewService.getReviewByFipeId).toHaveBeenCalledTimes(0);
      expect(ownerReviewService.listPaginatedByVersion).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status DEACTIVE and throw not found', () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ status: MyCarProductStatusEnum.DEACTIVE } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryOwnerReview> = sut.execute(userId, carId).unsafeRun();

      expect(promise).rejects.toThrow(CarSubscriptionDeactivatedFoundError);
      expect(ownerReviewService.getReviewByFipeId).toHaveBeenCalledTimes(0);
      expect(ownerReviewService.listPaginatedByVersion).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status EXCLUDED and throw not found', () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ status: MyCarProductStatusEnum.EXCLUDED } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryOwnerReview> = sut.execute(userId, carId).unsafeRun();

      expect(promise).rejects.toThrow(CarSubscriptionDeactivatedFoundError);
      expect(ownerReviewService.getReviewByFipeId).toHaveBeenCalledTimes(0);
      expect(ownerReviewService.listPaginatedByVersion).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status EXCLUDING', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce({
        ...carProductMock,
        status: MyCarProductStatusEnum.EXCLUDING,
      } as MyCarProductWithUserDto);

      const result: Promise<MyCarQueryOwnerReview> = sut.execute(userId, carId).unsafeRun();

      await expect(result).rejects.toThrow(ProviderUnavailableDomainError);
      expect(ownerReviewService.getReviewByFipeId).toHaveBeenCalledTimes(1);
    });

    test('should call getByUserIdAndCarId once with userId and CardId', async () => {
      await sut.execute(userId, carId).safeRun();

      expect(myCarProductRepository.getByUserIdAndCarId).toHaveBeenCalledTimes(1);
      expect(myCarProductRepository.getByUserIdAndCarId).toHaveBeenCalledWith(userId, carId);
    });

    test('should request external provider once for info', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest.spyOn(ownerReviewService, 'getReviewByFipeId').mockResolvedValueOnce(generalReviewMock);
      jest.spyOn(ownerReviewService, 'listPaginatedByVersion').mockResolvedValueOnce(paginatedReviewsMock);

      await sut.execute(userId, carId).safeRun();

      expect(ownerReviewService.getReviewByFipeId).toHaveBeenCalledTimes(1);
      expect(ownerReviewService.listPaginatedByVersion).toHaveBeenCalledTimes(1);
    });

    test('should return provider unavailable error when no response', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest.spyOn(ownerReviewService, 'getReviewByFipeId').mockResolvedValueOnce(null);
      jest.spyOn(ownerReviewService, 'listPaginatedByVersion').mockResolvedValueOnce(paginatedReviewsMock);

      const promise: Promise<MyCarQueryOwnerReview> = sut.execute(userId, carId).unsafeRun();
      expect(promise).rejects.toThrow(ProviderUnavailableDomainError);
    });

    test('should return valid response', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest.spyOn(ownerReviewService, 'getReviewByFipeId').mockResolvedValueOnce(generalReviewMock);
      jest.spyOn(ownerReviewService, 'listPaginatedByVersion').mockResolvedValueOnce(paginatedReviewsMock);

      await sut
        .execute(userId, carId)
        .map((myCarPartsAndValues: MyCarQueryOwnerReview) => {
          expect(myCarPartsAndValues).toStrictEqual({
            rankingAverage: {
              totalScore: generalReviewMock.totalScore,
              fields: [
                { property: 'Acabamento e Conforto', rank: generalReviewMock.comfort },
                { property: 'Câmbio', rank: generalReviewMock.cambium },
                { property: 'Consumo na cidade', rank: generalReviewMock.cityConsumption },
                { property: 'Consumo na estrada', rank: generalReviewMock.roadConsumption },
                { property: 'Desempenho', rank: generalReviewMock.performance },
                { property: 'Dirigibilidade', rank: generalReviewMock.drivability },
                { property: 'Espaço interno', rank: generalReviewMock.internalSpace },
                { property: 'Estabilidade', rank: generalReviewMock.stability },
                { property: 'Freios', rank: generalReviewMock.brakes },
                { property: 'Porta-malas', rank: generalReviewMock.trunk },
                { property: 'Suspensão', rank: generalReviewMock.suspension },
                { property: 'Custo-benefício', rank: generalReviewMock.costBenefit },
              ],
            },
            reviews: paginatedReviewsMock.items.map((review: OwnerReviewFullDto) => ({
              cons: review.cons,
              flaws: review.flaws,
              generalFeedback: review.generalFeedback,
              km: review.km,
              name: review.owner?.name || '-',
              ranking: {
                fields: [
                  { property: 'Acabamento e Conforto', rank: review.ranking.comfort },
                  { property: 'Câmbio', rank: review.ranking.cambium },
                  { property: 'Consumo na cidade', rank: review.ranking.cityConsumption },
                  { property: 'Consumo na estrada', rank: review.ranking.roadConsumption },
                  { property: 'Desempenho', rank: review.ranking.performance },
                  { property: 'Dirigibilidade', rank: review.ranking.drivability },
                  { property: 'Espaço interno', rank: review.ranking.internalSpace },
                  { property: 'Estabilidade', rank: review.ranking.stability },
                  { property: 'Freios', rank: review.ranking.brakes },
                  { property: 'Porta-malas', rank: review.ranking.trunk },
                  { property: 'Suspensão', rank: review.ranking.suspension },
                  { property: 'Custo-benefício', rank: review.ranking.costBenefit },
                ],
                totalScore: review.ranking.totalScore,
              },
              reviewAt: review.createdAt,
              strengths: review.strengths,
            })),
          });
        })
        .unsafeRun();
    });
  });
});
