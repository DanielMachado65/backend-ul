import { Test, TestingModule } from '@nestjs/testing';
import { SendAlertOnQueryUseCase } from 'src/data/core/product/send-alert-on-query.use-case';
import { MyCarProductStatusEnum, MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import { NotificationChannel } from 'src/domain/_entity/notification.entity';
import { QueryKeys } from 'src/domain/_entity/query.entity';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { NotificationIdentifier } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import {
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
} from 'src/domain/_layer/infrastructure/service/notification';
import { SendAlertOnQueryDomain } from 'src/domain/core/product/send-alert-on-query.domain';

describe('SendAlertOnQueryUseCase', () => {
  let sut: SendAlertOnQueryUseCase;
  let module: TestingModule;
  let myCarProductRepository: MyCarProductRepository;
  let notificationServiceGen: NotificationServiceGen;
  let notificationInfrastructure: NotificationInfrastructure;

  const userId: string = 'any_user_id';
  const queryKeys: QueryKeys = {
    plate: 'any_plate',
    chassis: 'any_chassis',
    engine: 'any_engine',
  };
  const myCarProductResponse: MyCarProductWithUserDto = {
    userId: 'any_user_id',
    billingId: 'any_billing_id',
    carId: 'any_car_id',
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
      isEnabled: true,
      notificationChannels: [NotificationChannel.EMAIL, NotificationChannel.PUSH],
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: SendAlertOnQueryDomain,
          useClass: SendAlertOnQueryUseCase,
        },
        {
          provide: MyCarProductRepository,
          useValue: {
            getActiveByKeys: jest.fn().mockReturnValue([]),
          },
        },
        {
          provide: NotificationServiceGen,
          useValue: {
            dispatch: jest.fn(),
          },
        },
        {
          provide: NotificationInfrastructure,
          useValue: {
            dispatch: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = module.get(SendAlertOnQueryDomain);
    myCarProductRepository = module.get(MyCarProductRepository);
    notificationServiceGen = module.get(NotificationServiceGen);
    notificationInfrastructure = module.get(NotificationInfrastructure);
  });

  describe('#send', () => {
    test('should call getActiveByKeys one time with userId and querykeys', async () => {
      await sut.send(userId, queryKeys).safeRun();

      expect(myCarProductRepository.getActiveByKeys).toHaveBeenCalledTimes(1);
      expect(myCarProductRepository.getActiveByKeys).toHaveBeenCalledWith(userId, queryKeys);
    });

    test('should not call dispatch by email', async () => {
      await sut.send(userId, queryKeys).safeRun();

      expect(notificationServiceGen.dispatch).toHaveBeenCalledTimes(0);
    });

    test('should call dispatch by email one time with keys', async () => {
      jest.spyOn(myCarProductRepository, 'getActiveByKeys').mockResolvedValueOnce([myCarProductResponse]);

      await sut.send(userId, queryKeys).safeRun();

      expect(notificationServiceGen.dispatch).toHaveBeenCalledTimes(1);
      expect(notificationServiceGen.dispatch).toHaveBeenLastCalledWith(
        NotificationTransport.EMAIL,
        NotificationType.QUERY_ALERT,
        {
          email: myCarProductResponse.email,
          name: myCarProductResponse.name,
          plate: myCarProductResponse.keys.plate,
        },
      );
    });

    test('should call two times dispatch by email if has two same plates equal', async () => {
      jest
        .spyOn(myCarProductRepository, 'getActiveByKeys')
        .mockResolvedValueOnce([myCarProductResponse, myCarProductResponse]);

      await sut.send(userId, queryKeys).safeRun();

      expect(notificationServiceGen.dispatch).toHaveBeenCalledTimes(2);
    });

    test('should not call dispatch by email if config is false', async () => {
      jest.spyOn(myCarProductRepository, 'getActiveByKeys').mockResolvedValueOnce([
        {
          ...myCarProductResponse,
          onQueryConfig: { isEnabled: false, notificationChannels: [NotificationChannel.EMAIL] },
        },
      ]);

      await sut.send(userId, queryKeys).safeRun();

      expect(notificationServiceGen.dispatch).toHaveBeenCalledTimes(0);
    });

    test('should not call dispatch by email if config is true but dont has notification channels', async () => {
      jest.spyOn(myCarProductRepository, 'getActiveByKeys').mockResolvedValueOnce([
        {
          ...myCarProductResponse,
          onQueryConfig: { isEnabled: true, notificationChannels: [] },
        },
      ]);

      await sut.send(userId, queryKeys).safeRun();

      expect(notificationServiceGen.dispatch).toHaveBeenCalledTimes(0);
    });

    test('should call dispatch by app one time with keys', async () => {
      jest.spyOn(myCarProductRepository, 'getActiveByKeys').mockResolvedValueOnce([myCarProductResponse]);

      await sut.send(userId, queryKeys).safeRun();

      expect(notificationInfrastructure.dispatch).toHaveBeenCalledTimes(1);
      expect(notificationInfrastructure.dispatch).toHaveBeenLastCalledWith(
        NotificationIdentifier.QUERY_ALERT,
        [{ subscriberId: myCarProductResponse.userId }],
        { userUF: myCarProductResponse.userUF },
      );
    });

    test('should not call dispatch by app if config is false', async () => {
      jest.spyOn(myCarProductRepository, 'getActiveByKeys').mockResolvedValueOnce([
        {
          ...myCarProductResponse,
          onQueryConfig: { isEnabled: false, notificationChannels: [NotificationChannel.PUSH] },
        },
      ]);

      await sut.send(userId, queryKeys).safeRun();

      expect(notificationInfrastructure.dispatch).toHaveBeenCalledTimes(0);
    });

    test('should not call dispatch by app if config is true and dont has notification channels', async () => {
      jest.spyOn(myCarProductRepository, 'getActiveByKeys').mockResolvedValueOnce([
        {
          ...myCarProductResponse,
          onQueryConfig: { isEnabled: true, notificationChannels: [] },
        },
      ]);

      await sut.send(userId, queryKeys).safeRun();

      expect(notificationInfrastructure.dispatch).toHaveBeenCalledTimes(0);
    });

    test('should call dispatch by app two times if has two same plates', async () => {
      jest
        .spyOn(myCarProductRepository, 'getActiveByKeys')
        .mockResolvedValueOnce([myCarProductResponse, myCarProductResponse]);

      await sut.send(userId, queryKeys).safeRun();

      expect(notificationInfrastructure.dispatch).toHaveBeenCalledTimes(2);
    });
  });
});
