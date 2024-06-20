import { Test, TestingModule } from '@nestjs/testing';
import { MyCarsQueryHelper } from 'src/data/core/product/my-cars-query.helper';
import { QueryMainFlawsUseCase } from 'src/data/core/product/query-main-flaws.use-case';
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
import { MyCarQueryMainFlaws } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { QueryMainFlawsDomain } from 'src/domain/core/product/query-main-flaws.domain';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';

describe('QueryMainFlawsUseCase', () => {
  let sut: QueryMainFlawsDomain;
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
      versionId: 'any_version_id',
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
      brand: 'RENAULT',
      model: 'CLIO',
      engineCapacity: '999',
      chassis: 'any_chassis',
    },
    response: {
      vehicleDiagnostic: {
        generic: [
          {
            description: 'Falha Sensor de Detonação',
            solutions: [],
            occurrences: 7241,
            totalDiagnostics: 46519,
            occurrencesPercentage: '15,57',
            dtc: '018',
          },
          {
            description: 'Falha na aprendizagem da Borboleta',
            solutions: [
              {
                description: 'REALIZAÇÃO DO AJUSTE RESET DE PARÂMETROS ADAPTATIVOS',
              },
              {
                description: 'REALIZAÇÃO DA LIMPEZA DO CORPO DE BORBOLETA',
              },
            ],
            occurrences: 5782,
            totalDiagnostics: 46519,
            occurrencesPercentage: '12,43',
            dtc: '126',
          },
        ],
        specific: [],
      },
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        MyCarsQueryHelper,
        CurrencyUtil,
        {
          provide: QueryMainFlawsDomain,
          useClass: QueryMainFlawsUseCase,
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
  });

  beforeEach(async () => {
    sut = await module.resolve(QueryMainFlawsDomain);
  });

  describe('#execute', () => {
    test('should call execute and return CarNotFoundError error', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce(null);

      const promise: Promise<MyCarQueryMainFlaws> = sut.execute(userId, carId).unsafeRun();

      expect(promise).rejects.toThrow(CarNotFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status DEACTIVE and throw not found', () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ status: MyCarProductStatusEnum.DEACTIVE } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryMainFlaws> = sut.execute(userId, carId).unsafeRun();

      expect(promise).rejects.toThrow(CarSubscriptionDeactivatedFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status EXCLUDED and throw not found', () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ status: MyCarProductStatusEnum.EXCLUDED } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryMainFlaws> = sut.execute(userId, carId).unsafeRun();

      expect(promise).rejects.toThrow(CarSubscriptionDeactivatedFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status EXCLUDING', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce({
        ...carProductMock,
        status: MyCarProductStatusEnum.EXCLUDING,
      } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryMainFlaws> = sut.execute(userId, carId).unsafeRun();

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

    test('should call getAsyncQueryByReference one time with queryRef', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      await sut.execute(userId, carId).safeRun();

      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(1);
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

      const promise: Promise<MyCarQueryMainFlaws> = sut.execute(userId, carId).unsafeRun();
      await expect(promise).rejects.toThrow(ProviderUnavailableDomainError);
    });

    test('should return valid response', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      const result: Promise<MyCarQueryMainFlaws> = sut.execute(userId, carId).unsafeRun();

      await expect(result).resolves.toStrictEqual({
        flaws: [
          {
            description: 'Falha Sensor de Detonação',
            occurrencePercent: 0.1557,
            analysisCount: 46519,
            identifiedFlawsCount: 7241,
            solution: '-',
          },
          {
            description: 'Falha na aprendizagem da Borboleta',
            occurrencePercent: 0.1243,
            analysisCount: 46519,
            identifiedFlawsCount: 5782,
            solution:
              'REALIZAÇÃO DO AJUSTE RESET DE PARÂMETROS ADAPTATIVOS | REALIZAÇÃO DA LIMPEZA DO CORPO DE BORBOLETA',
          },
        ],
      });
    });
  });
});
