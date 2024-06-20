import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryFinesHelper } from 'src/data/core/product/helpers/query-fines.helper';
import { NotificationChannel } from 'src/domain/_entity/notification.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { ConfigureAlertOnQueryDto } from 'src/domain/_layer/data/dto/configure-alert-on-query.dto';
import { ConfigureAlertFineDomain } from 'src/domain/core/product/configure-alert-fine.domain';
import { ConfigureAlertFipePriceDomain } from 'src/domain/core/product/configure-alert-fipe-price.domain';
import { ConfigureAlertOnQueryDomain } from 'src/domain/core/product/configure-alert-on-query.domain';
import { ConfigureAlertRevisionDomain } from 'src/domain/core/product/configure-alert-revision.domain';
import { DispatchNotificationDomain } from 'src/domain/core/product/dispatch-notification.domain';
import { ExcludeProductBoughtDomain } from 'src/domain/core/product/exclude-bought-product.domain';
import { GetFineMyCarProductDomain } from 'src/domain/core/product/get-alert-fine-config.domain';
import { GetAlertFipePriceConfigDomain } from 'src/domain/core/product/get-alert-fipe-price-config.domain.';
import { GetAlertOnQueryConfigDomain } from 'src/domain/core/product/get-alert-on-query-config.domain';
import { GetRevisionConfigMyCarProductDomain } from 'src/domain/core/product/get-alert-revision-plan-config.domain';
import { GetAttributesMyCarProductDomain } from 'src/domain/core/product/get-attributes-alert-config.domain';
import { GetBoughtProductDomain } from 'src/domain/core/product/get-bought-product.domain';
import { GetPlanAvailabilityDomain } from 'src/domain/core/product/get-plan-availability.domain';
import { ListAllBoughtProductDomain } from 'src/domain/core/product/list-all-bought-product.domain';
import { QueryDatasheetDomain } from 'src/domain/core/product/query-datasheet.domain';
import { QueryFinesDomain } from 'src/domain/core/product/query-fines.domain';
import { QueryFipePriceDomain } from 'src/domain/core/product/query-fipe-price.domain';
import { QueryInsuranceQuoteDomain } from 'src/domain/core/product/query-insurance-quote.domain';
import { QueryMainFlawsDomain } from 'src/domain/core/product/query-main-flaws.domain';
import { QueryOwnerReviewDomain } from 'src/domain/core/product/query-owner-review.domain';
import { QueryPartsAndValuesDomain } from 'src/domain/core/product/query-parts-and-values.domain';
import { QueryRevisionPlanDomain } from 'src/domain/core/product/query-revision-plan.domain';
import { RegisterMyCarDomain } from 'src/domain/core/product/register-my-car.domain';
import { UpgradeMyCarProductToPremiumDomain } from 'src/domain/core/product/upgrade-my-car-product-to-premium.domain';
import { UserInfo } from 'src/infrastructure/middleware/user-info.middleware';
import { MyCarsController } from 'src/presentation/core/product/my-cars.controller';

describe('MyCarsController', () => {
  let sut: MyCarsController;
  let module: TestingModule;
  let configureAlertOnQueryDomain: ConfigureAlertOnQueryDomain;
  let getAlertOnQueryConfigDomain: GetAlertOnQueryConfigDomain;
  let getAlertFipePriceConfigDomain: GetAlertFipePriceConfigDomain;
  let configureAlertFipePriceDomain: ConfigureAlertFipePriceDomain;

  const carId: string = 'any_car_id';
  const userInfo: UserInfo = {
    maybeToken: 'any_token',
    maybeUserId: 'any_maybe_user_id',
    roles: [],
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaultEither: EitherIO<UnknownDomainError, any> = EitherIO.of(UnknownDomainError.toFn(), () => null);

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [MyCarsController],
      providers: [
        {
          provide: GetBoughtProductDomain,
          useValue: {},
        },
        {
          provide: ExcludeProductBoughtDomain,
          useValue: {},
        },
        {
          provide: ListAllBoughtProductDomain,
          useValue: {},
        },
        {
          provide: RegisterMyCarDomain,
          useValue: {},
        },
        {
          provide: UpgradeMyCarProductToPremiumDomain,
          useValue: {},
        },
        {
          provide: QueryDatasheetDomain,
          useValue: {},
        },
        {
          provide: QueryFinesHelper,
          useValue: {},
        },
        {
          provide: QueryFinesDomain,
          useValue: {},
        },
        {
          provide: QueryFipePriceDomain,
          useValue: {},
        },
        {
          provide: QueryInsuranceQuoteDomain,
          useValue: {},
        },
        {
          provide: QueryMainFlawsDomain,
          useValue: {},
        },
        {
          provide: QueryOwnerReviewDomain,
          useValue: {},
        },
        {
          provide: QueryPartsAndValuesDomain,
          useValue: {},
        },
        {
          provide: QueryRevisionPlanDomain,
          useValue: {},
        },
        {
          provide: GetPlanAvailabilityDomain,
          useValue: {},
        },
        {
          provide: ConfigureAlertRevisionDomain,
          useValue: {},
        },
        {
          provide: GetAttributesMyCarProductDomain,
          useValue: {},
        },
        {
          provide: DispatchNotificationDomain,
          useValue: {},
        },
        {
          provide: ConfigureAlertFineDomain,
          useValue: {},
        },
        {
          provide: ConfigureAlertOnQueryDomain,
          useValue: {
            configure: jest.fn().mockReturnValue(defaultEither),
          },
        },
        {
          provide: GetAlertOnQueryConfigDomain,
          useValue: {
            load: jest.fn().mockReturnValue(defaultEither),
          },
        },
        {
          provide: ConfigureAlertFipePriceDomain,
          useValue: {
            configure: jest.fn().mockReturnValue(defaultEither),
          },
        },
        {
          provide: GetAlertFipePriceConfigDomain,
          useValue: {
            load: jest.fn().mockReturnValue(defaultEither),
          },
        },
        {
          provide: GetRevisionConfigMyCarProductDomain,
          useValue: {},
        },
        {
          provide: GetFineMyCarProductDomain,
          useValue: {},
        },
      ],
    }).compile();

    sut = module.get(MyCarsController);
    configureAlertOnQueryDomain = module.get(ConfigureAlertOnQueryDomain);
    getAlertOnQueryConfigDomain = module.get(GetAlertOnQueryConfigDomain);
    getAlertFipePriceConfigDomain = module.get(GetAlertFipePriceConfigDomain);
    configureAlertFipePriceDomain = module.get(ConfigureAlertFipePriceDomain);
  });

  describe('#getAlertFipePriceConfig', () => {
    test('should call load one time with keys', async () => {
      await sut.getAlertFipePriceConfig(userInfo, carId);

      expect(getAlertFipePriceConfigDomain.load).toHaveBeenCalledTimes(1);
      expect(getAlertFipePriceConfigDomain.load).toHaveBeenCalledWith(carId, userInfo.maybeUserId);
    });
  });

  describe('#configureAlertFipePrice', () => {
    test('should call configure one time with keys', async () => {
      const configure: ConfigureAlertOnQueryDto = {
        isEnabled: true,
        notificationChannels: [NotificationChannel.PUSH],
      };
      await sut.configureAlertFipePrice(userInfo, carId, configure);

      expect(configureAlertFipePriceDomain.configure).toHaveBeenCalledTimes(1);
      expect(configureAlertFipePriceDomain.configure).toHaveBeenCalledWith(carId, userInfo.maybeUserId, configure);
    });
  });

  describe('#configureAlertOnQuery', () => {
    test('should call configure one time with keys', async () => {
      const configure: ConfigureAlertOnQueryDto = {
        isEnabled: true,
        notificationChannels: [NotificationChannel.PUSH],
      };
      await sut.configureAlertOnQuery(userInfo, carId, configure);

      expect(configureAlertOnQueryDomain.configure).toHaveBeenCalledTimes(1);
      expect(configureAlertOnQueryDomain.configure).toHaveBeenCalledWith(carId, userInfo.maybeUserId, configure);
    });
  });

  describe('#getAlertOnQueryConfig', () => {
    test('should call laod with response one and keys', async () => {
      await sut.getAlertOnQueryConfig(userInfo, carId);

      expect(getAlertOnQueryConfigDomain.load).toHaveBeenCalledTimes(1);
      expect(getAlertOnQueryConfigDomain.load).toHaveBeenCalledWith(carId, userInfo.maybeUserId);
    });
  });
});
