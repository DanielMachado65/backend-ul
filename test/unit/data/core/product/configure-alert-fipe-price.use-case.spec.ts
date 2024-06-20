import { Test, TestingModule } from '@nestjs/testing';
import { ConfigureAlertFipePriceUseCase } from 'src/data/core/product/configure-alert-fipe-price.use-case';
import { MyCarProductStatusEnum, MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import { NotificationChannel } from 'src/domain/_entity/notification.entity';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { ConfigureAlertOnQueryDto } from 'src/domain/_layer/data/dto/configure-alert-on-query.dto';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { ConfigureAlertFipePriceDomain } from 'src/domain/core/product/configure-alert-fipe-price.domain';

describe('ConfigureAlertFipePriceUseCase', () => {
  let sut: ConfigureAlertFipePriceUseCase;
  let module: TestingModule;
  let myCarProductRepository: MyCarProductRepository;

  const carId: string = 'any_car_id';
  const userId: string = 'any_user_id';
  const configure: ConfigureAlertOnQueryDto = {
    isEnabled: false,
    notificationChannels: [],
  };
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
          provide: ConfigureAlertFipePriceDomain,
          useClass: ConfigureAlertFipePriceUseCase,
        },
        {
          provide: MyCarProductRepository,
          useValue: {
            updateById: jest.fn(),
            getByUserIdAndCarId: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = module.get(ConfigureAlertFipePriceDomain);
    myCarProductRepository = module.get(MyCarProductRepository);
  });

  describe('#configure', () => {
    test('should throw UnknownDomainError if try get data', () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockRejectedValueOnce(new Error());

      const error: UnknownDomainError = new UnknownDomainError();
      const result: Promise<ConfigureAlertOnQueryDto> = sut.configure('', '', configure).unsafeRun();

      expect(result).rejects.toEqual(error);
    });

    test('should call getByUserIdAndCarId one time with keys', async () => {
      await sut.configure(carId, userId, configure).safeRun();

      expect(myCarProductRepository.getByUserIdAndCarId).toHaveBeenCalledTimes(1);
      expect(myCarProductRepository.getByUserIdAndCarId).toHaveBeenCalledWith(userId, carId);
    });

    test('should throw CarNotFoundError if owner is invalid', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce(myCarProductResponse as MyCarProductWithUserDto);

      const error: CarNotFoundError = new CarNotFoundError();
      const result: Promise<ConfigureAlertOnQueryDto> = sut.configure('order_id', userId, configure).unsafeRun();
      expect(result).rejects.toEqual(error);
    });

    test('should throw CarNotFoundError if user is invalid', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce(myCarProductResponse as MyCarProductWithUserDto);

      const error: CarNotFoundError = new CarNotFoundError();
      const result: Promise<ConfigureAlertOnQueryDto> = sut.configure(carId, 'order_id', configure).unsafeRun();
      expect(result).rejects.toEqual(error);
    });

    test('should throw CarSubscriptionDeactivatedFoundError if not premium', () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ ...myCarProductResponse, type: MyCarProductTypeEnum.FREEMIUM } as MyCarProductWithUserDto);

      const error: CarSubscriptionDeactivatedFoundError = new CarSubscriptionDeactivatedFoundError();
      const result: Promise<ConfigureAlertOnQueryDto> = sut.configure(carId, userId, configure).unsafeRun();

      expect(result).rejects.toEqual(error);
    });

    test('should call updateById one time with keys', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValue({ ...myCarProductResponse } as MyCarProductWithUserDto);

      await sut.configure(carId, userId, configure).safeRun();

      expect(myCarProductRepository.updateById).toHaveBeenCalledTimes(1);
      expect(myCarProductRepository.updateById).toHaveBeenCalledWith(carId, {
        priceFIPEConfig: {
          isEnabled: configure.isEnabled,
          notificationChannels: configure.notificationChannels,
        },
      });
    });

    test('should update and get response', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValue({ ...myCarProductResponse } as MyCarProductWithUserDto);
      jest.spyOn(myCarProductRepository, 'updateById').mockResolvedValue({ ...myCarProductResponse } as never);

      const result: ConfigureAlertOnQueryDto = await sut.configure(carId, userId, configure).unsafeRun();
      expect(result).toEqual({
        isEnabled: myCarProductResponse.priceFIPEConfig.isEnabled,
        notificationChannels: myCarProductResponse.priceFIPEConfig.notificationChannels,
      });
    });
  });
});
