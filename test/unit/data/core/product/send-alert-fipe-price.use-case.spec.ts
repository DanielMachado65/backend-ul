import { Test, TestingModule } from '@nestjs/testing';

import { MyCarsQueryHelper } from 'src/data/core/product/my-cars-query.helper';
import { SendAlertFipePriceUseCase } from 'src/data/core/product/send-alert-fipe-price.use-case';
import { MyCarKeys, MyCarProductStatusEnum, MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import { NotificationChannel } from 'src/domain/_entity/notification.entity';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { NotificationServiceGen } from 'src/domain/_layer/infrastructure/service/notification';
import { SendAlertFipePriceDomain } from 'src/domain/core/product/send-alert-fipe-price.domain';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';

describe('SendAlertFipePriceUseCase', () => {
  let sut: SendAlertFipePriceUseCase;
  let module: TestingModule;
  let myCarProductRepository: MyCarProductRepository;
  let myCarsQueryHelper: MyCarsQueryHelper;
  let currencyUtil: CurrencyUtil;

  const TEMPLATE_QUERY: string = '939';

  const myCar: Partial<MyCarProductWithUserDto> = {
    userId: 'any_user_id',
    billingId: 'any_billing_id',
    carId: 'any_car_id',
    email: 'any_email',
    name: 'any_name',
    userUF: 'any_uf',
    status: MyCarProductStatusEnum.ACTIVE,
    keys: {
      plate: 'any_plate',
    } as MyCarKeys,
    type: MyCarProductTypeEnum.PREMIUM,
    onQueryConfig: null,
    revisionConfig: null,
    priceFIPEConfig: {
      isEnabled: true,
      notificationChannels: [NotificationChannel.PUSH, NotificationChannel.EMAIL],
    },
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: SendAlertFipePriceDomain,
          useClass: SendAlertFipePriceUseCase,
        },
        {
          provide: MyCarProductRepository,
          useValue: {
            getAllIncludeUser: jest.fn(),
          },
        },
        {
          provide: NotificationServiceGen,
          useValue: {
            dispatch: jest.fn(),
          },
        },
        {
          provide: MyCarsQueryHelper,
          useValue: {
            requestQuery: jest.fn().mockReturnValue(jest.fn()),
            getResponse: jest.fn().mockReturnValue(
              jest.fn().mockReturnValue({
                response: {
                  fipeHistory: [
                    {
                      history: [
                        {
                          price: 2000,
                        },
                        {
                          price: 2000,
                        },
                      ],
                    },
                  ],
                },
              }),
            ),
          },
        },
        {
          provide: CurrencyUtil,
          useValue: {
            numToCurrency: jest.fn().mockReturnValue({ toFormat: jest.fn() }),
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

    sut = module.get(SendAlertFipePriceDomain);
  });

  beforeEach(async () => {
    myCarProductRepository = await module.resolve(MyCarProductRepository);
    myCarsQueryHelper = await module.resolve(MyCarsQueryHelper);
    currencyUtil = await module.resolve(CurrencyUtil);
  });

  describe('#execute', () => {
    test('should call getAllIncludeUser one time with params', async () => {
      await sut.execute().unsafeRun();

      expect(myCarProductRepository.getAllIncludeUser).toHaveBeenCalledTimes(1);
      expect(myCarProductRepository.getAllIncludeUser).toHaveBeenCalledWith({
        'priceFIPEConfig.isEnabled': true,
        type: MyCarProductTypeEnum.PREMIUM,
        status: MyCarProductStatusEnum.ACTIVE,
      });
    });

    test('should call not call requestQuery', async () => {
      jest.spyOn(myCarProductRepository, 'getAllIncludeUser').mockResolvedValueOnce([]);

      await sut.execute().unsafeRun();

      expect(myCarsQueryHelper.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should call requestQuery one time with query code', async () => {
      jest.spyOn(myCarProductRepository, 'getAllIncludeUser').mockResolvedValueOnce([myCar as MyCarProductWithUserDto]);

      await sut.execute().unsafeRun();

      expect(myCarsQueryHelper.requestQuery).toHaveBeenCalledTimes(1);
      expect(myCarsQueryHelper.requestQuery).toHaveBeenCalledWith(TEMPLATE_QUERY);
    });

    test('should call getResponse one time with timeout', async () => {
      jest.spyOn(myCarProductRepository, 'getAllIncludeUser').mockResolvedValueOnce([myCar as MyCarProductWithUserDto]);

      await sut.execute().unsafeRun();

      expect(myCarsQueryHelper.getResponse).toHaveBeenCalledTimes(1);
      expect(myCarsQueryHelper.getResponse).toHaveBeenCalledWith(20_000);
    });

    test('should call numToCurrency two times and format to money', async () => {
      jest.spyOn(myCarProductRepository, 'getAllIncludeUser').mockResolvedValueOnce([myCar as MyCarProductWithUserDto]);

      await sut.execute().unsafeRun();

      expect(currencyUtil.numToCurrency).toHaveBeenCalledTimes(2);
      expect(currencyUtil.numToCurrency).toHaveBeenCalledWith(20);
    });
  });
});
