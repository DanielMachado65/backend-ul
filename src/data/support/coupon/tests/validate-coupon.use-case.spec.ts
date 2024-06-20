import { Test, TestingModule } from '@nestjs/testing';
import { ValidateCouponUserUseCase } from '../validate-coupon-user.use-case';
import { CouponRepository } from 'src/domain/_layer/infrastructure/repository/coupon.repository';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';
import { CouponEntity } from 'src/domain/_entity/coupon.entity';
import {
  NoCouponFoundDomainError,
  UnknownDomainError,
  CouponExpiredDomainError,
  CouponLimitForUserReachedDomainError,
  CouponMinValueNotReachedDomainError,
} from 'src/domain/_entity/result.error';
import { CouponProductsInputDto } from 'src/domain/_layer/presentation/dto/coupon-products-input.dto';
import { CouponProductsOutputDto } from 'src/domain/_layer/presentation/dto/coupon-products-output.dto';
import { ProductsHelper } from '../../payment/product.helper';
import { QueryComposerRepository } from 'src/domain/_layer/infrastructure/repository/query-composer.repository';
import { PackageRepository } from 'src/domain/_layer/infrastructure/repository/package.repository';
import { PackageEntity } from 'src/domain/_entity/package.entity';
import { QueryComposeStatus, QueryComposerEntity, QueryComposerType } from 'src/domain/_entity/query-composer.entity';

describe(ValidateCouponUserUseCase.name, () => {
  let useCase: ValidateCouponUserUseCase;
  let couponRepository: CouponRepository;
  let queryComposerRepository: QueryComposerRepository;
  let packageRepository: PackageRepository;

  const products: CouponProductsInputDto = {
    packages: [
      { id: '1', amount: 1 },
      { id: '2', amount: 2 },
    ],
    queries: [
      {
        amount: 1,
        code: '123',
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateCouponUserUseCase,
        ProductsHelper,
        CurrencyUtil,
        {
          provide: CouponRepository,
          useValue: { getByCode: jest.fn() },
        },
        {
          provide: QueryComposerRepository,
          useValue: { getBatchByCodes: jest.fn() },
        },
        {
          provide: PackageRepository,
          useValue: { getBatchByIds: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<ValidateCouponUserUseCase>(ValidateCouponUserUseCase);
    couponRepository = module.get<CouponRepository>(CouponRepository);
    queryComposerRepository = module.get<QueryComposerRepository>(QueryComposerRepository);
    packageRepository = module.get<PackageRepository>(PackageRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('call', () => {
    beforeEach(() => {
      jest.spyOn(queryComposerRepository, 'getBatchByCodes').mockResolvedValue([
        {
          buyable: true,
          createdAt: new Date().toISOString(),
          exampleQueryId: '1',
          faqIds: [],
          fullDescription: 'Full description',
          id: '123',
          isNewFeature: false,
          isRecommended: false,
          name: 'Query name',
          queryCode: 123,
          queryInfoIds: [],
          queryMapId: '1',
          queryRulesId: '1',
          queryType: QueryComposerType.CREDIT,
          serviceIds: [],
          shortDescription: 'Short description',
          showInComparisonTable: false,
          status: QueryComposeStatus.ACTIVATED,
          testimonialIds: [],
          canBeTestDriven: false,
        } as QueryComposerEntity,
      ]);
      jest
        .spyOn(packageRepository, 'getBatchByIds')
        .mockResolvedValue([
          { id: '1', purchasePriceInCents: 10000 } as PackageEntity,
          { id: '2', purchasePriceInCents: 20000 } as PackageEntity,
        ]);
    });

    it('should return a valid coupon if it exists and can be used', async () => {
      const couponCode: string = 'VALID_COUPON';
      const coupon: CouponEntity = {
        id: '1',
        creatorId: '1',
        createdAt: new Date().toISOString(),
        status: true,
        code: couponCode,
        generatorId: '1',
        rules: {
          discountPercentage: 10,
          discountValueInCents: 100,
          minValueToApplyInCents: 0,
          expirationDate: new Date(Date.now() + 1000000).toISOString(), // Future date
          limitUsage: 10,
          usageMaxToUser: 10,
          authorized: { packages: [], signatures: [], queries: [] },
        },
      };

      jest.spyOn(couponRepository, 'getByCode').mockResolvedValue(coupon);
      const singleProduct: CouponProductsInputDto = {
        packages: [
          {
            id: '5abebd5830694740b8848ba3',
            amount: 1,
          },
        ],
        queries: [],
      };

      jest.spyOn(packageRepository, 'getBatchByIds').mockResolvedValue([
        {
          id: '5abebd5830694740b8848ba3',
          purchasePriceInCents: 14250,
          status: false,
          createAt: '',
          attributedValueInCents: 0,
          name: '',
          discountPercent: 0,
        },
      ]);
      jest.spyOn(queryComposerRepository, 'getBatchByCodes').mockResolvedValue([]);

      const result: CouponProductsOutputDto = await useCase.call(couponCode, singleProduct).unsafeRun();
      expect(result.couponCode).toEqual(coupon.code);
      expect(result.discountValueInCents).toEqual(coupon.rules.discountValueInCents);
      expect(result.totalPriceInCents).toEqual(14150);
      expect(result.totalPriceWithoutDiscountInCents).toEqual(14250);
    });

    it('should return NoCouponFoundDomainError if the coupon does not exist', async () => {
      const couponCode: string = 'INVALID_COUPON';

      jest.spyOn(couponRepository, 'getByCode').mockResolvedValue(null);

      await expect(useCase.call(couponCode, products).unsafeRun()).rejects.toThrow(NoCouponFoundDomainError);
    });

    it('should return UnknownDomainError if an unexpected error occurs', async () => {
      const couponCode: string = 'ERROR_COUPON';

      jest.spyOn(couponRepository, 'getByCode').mockRejectedValue(new Error('Unexpected error'));

      await expect(useCase.call(couponCode, products).unsafeRun()).rejects.toThrow(UnknownDomainError);
    });

    it('should return CouponExpiredDomainError if the coupon is expired', async () => {
      const couponCode: string = 'EXPIRED_COUPON';
      const coupon: CouponEntity = {
        id: '1',
        creatorId: '1',
        createdAt: new Date().toISOString(),
        status: true,
        code: couponCode,
        generatorId: '1',
        rules: {
          discountPercentage: 10,
          discountValueInCents: 100,
          minValueToApplyInCents: 10,
          expirationDate: new Date(Date.now() - 1000000).toISOString(), // Past date
          limitUsage: 1,
          usageMaxToUser: 1,
          authorized: { packages: [], signatures: [], queries: [] },
        },
      };

      jest.spyOn(couponRepository, 'getByCode').mockResolvedValue(coupon);

      await expect(useCase.call(couponCode, products).unsafeRun()).rejects.toThrow(CouponExpiredDomainError);
    });

    it('should return CouponLimitForUserReachedDomainError if the usage limit is reached', async () => {
      const couponCode: string = 'LIMIT_REACHED_COUPON';
      const coupon: CouponEntity = {
        id: '1',
        creatorId: '1',
        createdAt: new Date().toISOString(),
        status: true,
        code: couponCode,
        generatorId: '1',
        rules: {
          discountPercentage: 10,
          discountValueInCents: 100,
          minValueToApplyInCents: 10,
          expirationDate: new Date(Date.now() + 1000000).toISOString(), // Future date
          limitUsage: 1,
          usageMaxToUser: 1,
          authorized: { packages: [], signatures: [], queries: [] },
        },
      };

      jest.spyOn(couponRepository, 'getByCode').mockResolvedValue(coupon);

      await expect(useCase.call(couponCode, products).unsafeRun()).rejects.toThrow(
        CouponLimitForUserReachedDomainError,
      );
    });

    it('should return CouponMinValueNotReachedDomainError if the minimum value is not reached', async () => {
      const couponCode: string = 'MIN_VALUE_NOT_REACHED_COUPON';
      const coupon: CouponEntity = {
        id: '1',
        creatorId: '1',
        createdAt: new Date().toISOString(),
        status: true,
        code: couponCode,
        generatorId: '1',
        rules: {
          discountPercentage: 10,
          discountValueInCents: 100,
          minValueToApplyInCents: 10000,
          expirationDate: new Date(Date.now() + 1000000).toISOString(), // Future date
          limitUsage: 10,
          usageMaxToUser: 10,
          authorized: { packages: [], signatures: [], queries: [] },
        },
      };

      jest.spyOn(couponRepository, 'getByCode').mockResolvedValue(coupon);
      jest
        .spyOn(packageRepository, 'getBatchByIds')
        .mockResolvedValue([{ id: '1', purchasePriceInCents: 1000 } as PackageEntity]);

      const adjustedProducts: CouponProductsInputDto = {
        packages: [{ id: '1', amount: 1 }],
        queries: [
          {
            amount: 1,
            code: '123',
          },
        ],
      };

      await expect(useCase.call(couponCode, adjustedProducts).unsafeRun()).rejects.toThrow(
        CouponMinValueNotReachedDomainError,
      );
    });
  });
});
