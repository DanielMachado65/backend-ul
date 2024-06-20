import { Test, TestingModule } from '@nestjs/testing';
import { MyCarsQueryHelper } from 'src/data/core/product/my-cars-query.helper';
import { QueryPartsAndValuesUseCase } from 'src/data/core/product/query-parts-and-values.use-case';
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
import { MyCarQueryPartsAndValues } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { QueryPartsAndValuesDomain } from 'src/domain/core/product/query-parts-and-values.domain';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';

describe('QueryPartsAndValuesUseCase', () => {
  let sut: QueryPartsAndValuesDomain;
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
      plate: 'ABC1234',
      fipeId: '250619',
    },
    response: {
      basicPack: [
        {
          fipeId: 250619,
          modelYear: 2004,
          records: [
            {
              nicknameId: 7575,
              nicknameDescription: 'Amortecedor Diant. Dir.',
              complement: 'AMORTECEDOR DIANTEIRO',
              partNumber: 'GP30108',
              isGenuine: false,
              value: 123,
              aftermarketMakerDescription: 'Cofap',
            },
            {
              nicknameId: 7575,
              nicknameDescription: 'Amortecedor Diant. Dir.',
              complement: 'AMORTECEDOR DAINTEIRO',
              partNumber: 'GP30562',
              isGenuine: false,
              value: 234,
              aftermarketMakerDescription: 'Cofap',
            },
          ],
        },
        {
          fipeId: 250678,
          modelYear: 2004,
          records: [
            {
              nicknameId: 7575,
              nicknameDescription: 'Amortecedor Diant. Dir.',
              complement: 'KIT DO AMORTECEDOR DIANTEIRO COMPLETO (BATENTE/COIFA/COXIM/ROLAMENTO)',
              partNumber: 'TKC18101',
              isGenuine: false,
              value: 345,
              aftermarketMakerDescription: 'Cofap',
            },
            {
              nicknameId: 7575,
              nicknameDescription: 'Amortecedor Diant. Dir.',
              complement: 'AMORTECEDOR PRESSURIZADO - LD/LE',
              partNumber: 'HG33001',
              isGenuine: false,
              value: 456,
              aftermarketMakerDescription: 'Nakata',
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
          provide: QueryPartsAndValuesDomain,
          useClass: QueryPartsAndValuesUseCase,
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
    sut = await module.resolve(QueryPartsAndValuesDomain);
  });

  describe('#execute', () => {
    test('should call execute and return CarNotFoundError error', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce(null);

      const promise: Promise<MyCarQueryPartsAndValues> = sut.execute(userId, carId).unsafeRun();

      await expect(promise).rejects.toThrow(CarNotFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status DEACTIVE and throw not found', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ status: MyCarProductStatusEnum.DEACTIVE } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryPartsAndValues> = sut.execute(userId, carId).unsafeRun();

      await expect(promise).rejects.toThrow(CarSubscriptionDeactivatedFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status EXCLUDED and throw not found', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ status: MyCarProductStatusEnum.EXCLUDED } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryPartsAndValues> = sut.execute(userId, carId).unsafeRun();

      await expect(promise).rejects.toThrow(CarSubscriptionDeactivatedFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status EXCLUDING', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce({
        ...carProductMock,
        status: MyCarProductStatusEnum.EXCLUDING,
      } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryPartsAndValues> = sut.execute(userId, carId).unsafeRun();

      // expect(myCarQueryPartsAndValues).not.toEqual(null);
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

      const promise: Promise<MyCarQueryPartsAndValues> = sut.execute(userId, carId).unsafeRun();
      await expect(promise).rejects.toThrow(ProviderUnavailableDomainError);
    });

    test('should return valid response', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      const result: Promise<MyCarQueryPartsAndValues> = sut.execute(userId, carId).unsafeRun();

      await expect(result).resolves.toStrictEqual({
        parts: [
          {
            part: 'Amortecedor Diant. Dir.',
            complement: 'AMORTECEDOR DIANTEIRO',
            valueInCents: 12300,
          },
          {
            part: 'Amortecedor Diant. Dir.',
            complement: 'AMORTECEDOR DAINTEIRO',
            valueInCents: 23400,
          },
        ],
      });
    });
  });
});
