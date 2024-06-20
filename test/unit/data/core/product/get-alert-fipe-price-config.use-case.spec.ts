import { Test, TestingModule } from '@nestjs/testing';
import { GetAlertFipePriceConfigUseCase } from 'src/data/core/product/get-alert-fipe-price-config.use-case';
import { MyCarProductStatusEnum, MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import { NotificationChannel } from 'src/domain/_entity/notification.entity';
import { CarNotFoundError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { ConfigureAlertFipePriceDto } from 'src/domain/_layer/data/dto/configure-alert-fipe-price.dto';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { GetAlertFipePriceConfigDomain } from 'src/domain/core/product/get-alert-fipe-price-config.domain.';

describe('GetAlertFipePriceConfigUseCase', () => {
  let sut: GetAlertFipePriceConfigUseCase;
  let module: TestingModule;
  let myCarProductRepository: MyCarProductRepository;

  const carId: string = 'any_car_id';
  const userId: string = 'any_user_id';
  const myCarProductResponse: Partial<MyCarProductWithUserDto> = {
    userId: userId,
    billingId: 'any_billing_id',
    carId: carId,
    email: 'any_email',
    name: 'any_email',
    userUF: 'any_user_id',
    status: MyCarProductStatusEnum.ACTIVE,
    keys: {
      plate: 'any_plate',
      chassis: 'any_chassis',
      engineNumber: 'any_engine',
      brand: 'any_brand',
      fipeId: 'any_fipe_id',
      fipeName: 'any_fipe_name',
      brandModelCode: 'any_brand_model_code',
      engineCapacity: 'any_engine_capacity',
      model: 'any_model',
      modelYear: 2010,
      versionId: 'any_version_id',
      zipCode: 'any_zip_code',
    },
    type: MyCarProductTypeEnum.PREMIUM,
    onQueryConfig: {
      isEnabled: false,
      notificationChannels: [],
    },
    priceFIPEConfig: {
      isEnabled: true,
      notificationChannels: [NotificationChannel.EMAIL, NotificationChannel.PUSH],
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: GetAlertFipePriceConfigDomain,
          useClass: GetAlertFipePriceConfigUseCase,
        },
        {
          provide: MyCarProductRepository,
          useValue: {
            getByUserIdAndCarId: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = module.get(GetAlertFipePriceConfigDomain);
    myCarProductRepository = module.get(MyCarProductRepository);
  });

  describe('#load', () => {
    test('should call getByUserIdAndCarId one time with userId and carId', async () => {
      await sut.load(carId, userId).safeRun();

      expect(myCarProductRepository.getByUserIdAndCarId).toHaveBeenCalledTimes(1);
      expect(myCarProductRepository.getByUserIdAndCarId).toHaveBeenCalledWith(userId, carId);
    });

    test('should throw UnknownDomainError when try getByUserIdAndCarId', () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockRejectedValueOnce(new Error('any_error'));

      const error: UnknownDomainError = new UnknownDomainError();
      const result: Promise<ConfigureAlertFipePriceDto> = sut.load(carId, userId).unsafeRun();

      expect(result).rejects.toEqual(error);
    });

    test('should throw error if getByUserIdAndCarId retrun undefined', () => {
      const error: CarNotFoundError = new CarNotFoundError();
      const result: Promise<ConfigureAlertFipePriceDto> = sut.load(carId, userId).unsafeRun();

      expect(result).rejects.toEqual(error);
    });

    test('should throw error if carId is diferent owner', () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ ...myCarProductResponse, carId: 'order_id' } as MyCarProductWithUserDto);

      const error: CarNotFoundError = new CarNotFoundError();
      const result: Promise<ConfigureAlertFipePriceDto> = sut.load(carId, userId).unsafeRun();

      expect(result).rejects.toEqual(error);
    });

    test('should throw error if userId is diferent', () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ ...myCarProductResponse, userId: 'order_id' } as MyCarProductWithUserDto);

      const error: CarNotFoundError = new CarNotFoundError();
      const result: Promise<ConfigureAlertFipePriceDto> = sut.load(carId, userId).unsafeRun();

      expect(result).rejects.toEqual(error);
    });

    test('should load resposne', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce(myCarProductResponse as MyCarProductWithUserDto);

      const result: ConfigureAlertFipePriceDto = await sut.load(carId, userId).unsafeRun();

      expect(result).toEqual({
        isEnabled: myCarProductResponse.priceFIPEConfig.isEnabled,
        notificationChannels: myCarProductResponse.priceFIPEConfig.notificationChannels,
      });
    });
  });
});
