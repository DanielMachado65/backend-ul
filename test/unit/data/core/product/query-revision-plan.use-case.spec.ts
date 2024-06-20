import { Test, TestingModule } from '@nestjs/testing';
import { MyCarsQueryHelper } from 'src/data/core/product/my-cars-query.helper';
import { QueryRevisionPlanUseCase } from 'src/data/core/product/query-revision-plan.use-case';
import { MyCarProductStatusEnum } from 'src/domain/_entity/my-car-product.entity';
import { QueryResponseStatus } from 'src/domain/_entity/query-response.entity';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  ProviderUnavailableDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { MyCarQueryRevisionPlan } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { QueryRevisionPlanDomain } from 'src/domain/core/product/query-revision-plan.domain';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';

describe('QueryRevisionPlanUseCase', () => {
  let sut: QueryRevisionPlanDomain;
  let module: TestingModule;
  let myCarProductRepository: MyCarProductRepository;
  let queryRequestService: QueryRequestService;

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
      fipeId: '250619',
      fipeName: 'any_fipe_name',
      model: 'any_model',
      modelYear: 2021,
      plate: 'ABC1234',
      versionId: '1234',
      zipCode: 'any_zip_code',
    },
    email: 'any_email',
    name: 'any_name',
    carId: 'any_car_id',
    userId: 'any_user_id',
  };

  const queryResponseMock: Partial<QueryResponseDto> = {
    status: QueryResponseStatus.SUCCESS,
    keys: {
      plate: 'ABC1234',
      fipeId: '250619',
    },
    response: {
      revision: [
        {
          fipeId: 250619,
          versionId: 1234,
          year: 2004,
          records: [
            {
              durationMinutes: 123,
              inspections: ['peça 1', 'peça 3'],
              kilometers: 1024,
              months: 12,
              parcels: 4,
              changedParts: [
                { description: 'peça 2', amount: 1 },
                { description: 'peça 4', amount: 3 },
              ],
              parcelPrice: 256,
              fullPrice: 1024,
            },
            {
              durationMinutes: 123,
              inspections: ['peça 5', 'peça 6'],
              kilometers: 1024,
              months: 12,
              parcels: 4,
              changedParts: [
                { description: 'peça 7', amount: 2 },
                { description: 'peça 8', amount: 4 },
              ],
              parcelPrice: 256,
              fullPrice: 1024,
            },
          ],
        },
        {
          fipeId: 123123,
          versionId: 1234,
          year: 2004,
          records: [
            {
              durationMinutes: 123,
              inspections: ['peça 2', 'peça 3'],
              kilometers: 1024,
              months: 12,
              parcels: 4,
              changedParts: [
                { description: 'peça 1', amount: 1 },
                { description: 'peça 4', amount: 3 },
              ],
              parcelPrice: 256,
              fullPrice: 1024,
            },
          ],
        },
      ],
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        MyCarsQueryHelper,
        CurrencyUtil,
        {
          provide: QueryRevisionPlanDomain,
          useClass: QueryRevisionPlanUseCase,
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
      ],
    }).compile();

    myCarProductRepository = module.get(MyCarProductRepository);
    queryRequestService = module.get(QueryRequestService);

    sut = await module.resolve(QueryRevisionPlanDomain);
  });

  describe('#execute', () => {
    test('should call execute and return CarNotFoundError error', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce(null);

      const promise: Promise<MyCarQueryRevisionPlan> = sut.execute(userId, carId).unsafeRun();

      expect(promise).rejects.toThrow(CarNotFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status DEACTIVE and throw not found', () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ status: MyCarProductStatusEnum.DEACTIVE } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryRevisionPlan> = sut.execute(userId, carId).unsafeRun();

      expect(promise).rejects.toThrow(CarSubscriptionDeactivatedFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status EXCLUDED and throw not found', () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ status: MyCarProductStatusEnum.EXCLUDED } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryRevisionPlan> = sut.execute(userId, carId).unsafeRun();

      expect(promise).rejects.toThrow(CarSubscriptionDeactivatedFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status EXCLUDING', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce({
        ...carProductMock,
        status: MyCarProductStatusEnum.EXCLUDING,
      } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryRevisionPlan> = sut.execute(userId, carId).unsafeRun();

      await expect(promise).rejects.toThrow(ProviderUnavailableDomainError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(1);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(1);
    });

    test('should call getByUserIdAndCarId one time with userId and CardId', () => {
      sut.execute(userId, carId).safeRun();

      expect(myCarProductRepository.getByUserIdAndCarId).toHaveBeenCalledTimes(1);
      expect(myCarProductRepository.getByUserIdAndCarId).toHaveBeenCalledWith(userId, carId);
    });

    test('should call one requestQuery time', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      await sut.execute(userId, carId).safeRun();

      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(1);
    });

    test('should not return null response', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      const result: unknown = await sut.execute(userId, carId).unsafeRun();
      expect(result).not.toEqual(null);
    });

    test('should return provider unavailable error when no response', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce({ ...queryResponseMock, status: QueryResponseStatus.FAILED } as QueryResponseDto);

      const promise: Promise<MyCarQueryRevisionPlan> = sut.execute(userId, carId).unsafeRun();
      await expect(promise).rejects.toThrow(ProviderUnavailableDomainError);
    });

    test('should return valid response', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      const result: Promise<MyCarQueryRevisionPlan> = sut.execute(userId, carId).unsafeRun();

      await expect(result).resolves.toStrictEqual({
        revisionPlans: [
          {
            totalPrice: 'R$ 1.024,00',
            monthsToRevision: 12,
            kmToRevision: 1024,
            partsToInspect: [{ name: 'peça 1' }, { name: 'peça 3' }],
            partsToReplace: [{ name: 'peça 2' }, { name: 'peça 4' }],
          },
          {
            totalPrice: 'R$ 1.024,00',
            monthsToRevision: 12,
            kmToRevision: 1024,
            partsToInspect: [{ name: 'peça 5' }, { name: 'peça 6' }],
            partsToReplace: [{ name: 'peça 7' }, { name: 'peça 8' }],
          },
        ],
      });
    });
  });
});
