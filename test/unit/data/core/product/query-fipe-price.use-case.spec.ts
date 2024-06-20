import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Test, TestingModule } from '@nestjs/testing';
import { MyCarsQueryHelper } from 'src/data/core/product/my-cars-query.helper';

import { QueryFipePriceUseCase } from 'src/data/core/product/query-fipe-price.use-case';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { QueryFipePriceDomain } from 'src/domain/core/product/query-fipe-price.domain';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';

describe('QueryFipePriceUseCase', () => {
  let sut: QueryFipePriceUseCase;
  let module: TestingModule;
  let myCarsQueryHelper: MyCarsQueryHelper;

  const userId: string = 'user_id';
  const carId: string = 'car_id';
  const queryTemplate: string = '999';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: QueryFipePriceDomain,
          useClass: QueryFipePriceUseCase,
        },
        {
          provide: MyCarsQueryHelper,
          useValue: {
            getCar: jest.fn().mockReturnValue(EitherIO.of(UnknownDomainError.toFn(), null)),
            requestQuery: jest.fn(),
            getResponse: jest.fn(),
          },
        },
        {
          provide: DateTimeUtil,
          useValue: {
            fromDate: jest.fn().mockReturnValue({ format: jest.fn() }),
          },
        },
        {
          provide: CurrencyUtil,
          useValue: {
            toCurrency: jest.fn().mockReturnValue({ toFormat: jest.fn() }),
          },
        },
      ],
    }).compile();

    sut = await module.resolve(QueryFipePriceDomain);
  });

  beforeEach(() => {
    myCarsQueryHelper = module.get(MyCarsQueryHelper);
  });

  describe('#execute', () => {
    test('should call get car one time with userId and carId', async () => {
      await sut.execute(userId, carId).safeRun();

      expect(myCarsQueryHelper.getCar).toBeCalledTimes(1);
      expect(myCarsQueryHelper.getCar).toHaveBeenCalledWith(userId, carId);
    });

    test('should call requestQuery one time with templete', async () => {
      await sut.execute(userId, carId).safeRun();

      expect(myCarsQueryHelper.requestQuery).toBeCalledTimes(1);
      expect(myCarsQueryHelper.requestQuery).toHaveBeenCalledWith(queryTemplate);
    });

    test('should call getResponse one time with no params', async () => {
      await sut.execute(userId, carId).safeRun();

      expect(myCarsQueryHelper.getResponse).toBeCalledTimes(1);
      // expect(myCarsQueryHelper.getResponse).toHaveBeenCalledWith();
    });
  });
});
