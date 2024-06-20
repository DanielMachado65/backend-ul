import { Test, TestingModule } from '@nestjs/testing';
import { MyCarsQueryHelper } from 'src/data/core/product/my-cars-query.helper';
import { QueryInsuranceQuoteUseCase } from 'src/data/core/product/query-insurance-quote.use-case';
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
import { MyCarQueryInsuranceQuote } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { QueryInsuranceQuoteDomain } from 'src/domain/core/product/query-insurance-quote.domain';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';

describe('QueryInsuranceQuoteUseCase', () => {
  let sut: QueryInsuranceQuoteDomain;
  let module: TestingModule;
  let myCarProductRepository: MyCarProductRepository;
  let queryRequestService: QueryRequestService;

  const userId: string = 'any_user_id';
  const carId: string = 'any_car_id';
  const zipCode: string = 'any_zip_code';

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
      insuranceQuotes: [
        {
          model: 'any_model',
          modelYear: 2000,
          fipeId: '250619',
          coverages: [
            { kind: 'robbery_and_theft', priceCents: 123 },
            { kind: 'unlimited_km', priceCents: 234 },
            { kind: 'total_loss', priceCents: 345 },
            { kind: 'partial_loss', priceCents: 456 },
          ],
        },
        {
          model: 'any_model',
          modelYear: 2000,
          fipeId: '250620',
          coverages: [
            { kind: 'robbery_and_theft', priceCents: 987 },
            { kind: 'unlimited_km', priceCents: 876 },
            { kind: 'total_loss', priceCents: 765 },
            { kind: 'partial_loss', priceCents: 654 },
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
          provide: QueryInsuranceQuoteDomain,
          useClass: QueryInsuranceQuoteUseCase,
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

    sut = await module.resolve(QueryInsuranceQuoteDomain);
  });

  describe('#execute', () => {
    test('should call execute and return CarNotFoundError error', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce(null);

      const promise: Promise<MyCarQueryInsuranceQuote> = sut.execute(userId, carId, zipCode).unsafeRun();

      expect(promise).rejects.toThrow(CarNotFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status DEACTIVE and throw not found', () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ status: MyCarProductStatusEnum.DEACTIVE } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryInsuranceQuote> = sut.execute(userId, carId, zipCode).unsafeRun();

      expect(promise).rejects.toThrow(CarSubscriptionDeactivatedFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status EXCLUDED and throw not found', () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ status: MyCarProductStatusEnum.EXCLUDED } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryInsuranceQuote> = sut.execute(userId, carId, zipCode).unsafeRun();

      expect(promise).rejects.toThrow(CarSubscriptionDeactivatedFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status EXCLUDING and throw not found', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ status: MyCarProductStatusEnum.EXCLUDING } as MyCarProductWithUserDto);

      await sut
        .execute(userId, carId, zipCode)
        .tap((myCarQueryInsuranceQuote: MyCarQueryInsuranceQuote) => {
          expect(myCarQueryInsuranceQuote).not.toEqual(null);
        })
        .safeRun();

      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(1);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(1);
    });

    test('should call getByUserIdAndCarId one time with userId and CardId', () => {
      sut.execute(userId, carId, zipCode).safeRun();

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

      await sut.execute(userId, carId, zipCode).safeRun();

      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(1);
    });

    test('should call getAsyncQueryByReference one time with queryRef', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      await sut.execute(userId, carId, zipCode).safeRun();

      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(1);
    });

    test('should not return null response', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      const result: unknown = await sut.execute(userId, carId, zipCode).unsafeRun();
      expect(result).not.toEqual(null);
    });

    test('should return provider unavailable error when no response', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce({ ...queryResponseMock, status: QueryResponseStatus.FAILED } as QueryResponseDto);

      const promise: Promise<MyCarQueryInsuranceQuote> = sut.execute(userId, carId, zipCode).unsafeRun();
      await expect(promise).rejects.toThrow(ProviderUnavailableDomainError);
    });

    test('should return valid response', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      const result: Promise<MyCarQueryInsuranceQuote> = sut.execute(userId, carId, zipCode).unsafeRun();

      await expect(result).resolves.toStrictEqual({
        externalUrl:
          'https://www.pier.digital/seguro-auto?utm_source=parceiro-olho-no-carro&utm_medium=pc&utm_campaign=at_3_11_lead_pc-onc_parceiro',
        vehicleVersion: carProductMock.keys.fipeName,
        coverages: [
          {
            order: 1,
            isIncluded: true,
            name: 'Roubo e Furto + Assistências',
            description:
              'Seu carro protegido contra roubo e Furto. Se precisar utilize nossa assistência 24 horas em qualquer lugar do país',
            type: 'robbery_and_theft',
            priceInCents: 123,
          },
          {
            order: 2,
            isIncluded: false,
            name: 'Km ilimitado de guincho',
            description:
              'Ao adicionar esse benefício, você poderá utilizar o serviço de guincho para descolar o seu carro ao local desejado sem restrições de quilometragem (Km)',
            type: 'unlimited_km',
            priceInCents: 234,
          },
          {
            order: 3,
            isIncluded: false,
            name: 'Perda total',
            description:
              'Cobrimos todos os tipos de perda total do seu veículo, incluindo incêndio e desastres da natureza',
            type: 'total_loss',
            priceInCents: 345,
          },
          {
            order: 4,
            isIncluded: false,
            name: 'Perda parcial',
            description:
              'Cobrimos o conserto do carro em caso de acidentes, incluindo batidas, incêndio e desastres da natureza mediante pagamento de uma franquia',
            type: 'partial_loss',
            priceInCents: 456,
          },
        ],
      });
    });
  });
});
