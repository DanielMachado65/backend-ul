import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryFinesHelper } from 'src/data/core/product/helpers/query-fines.helper';
import { MyCarsQueryHelper } from 'src/data/core/product/my-cars-query.helper';

import { QueryFinesUseCase } from 'src/data/core/product/query-fines.use-case';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { QueryFinesDomain } from 'src/domain/core/product/query-fines.domain';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';

describe('QueryFinesUseCase', () => {
  let sut: QueryFinesUseCase;
  let module: TestingModule;
  let myCarsQueryHelper: MyCarsQueryHelper;

  const userId: string = 'any_user_id';
  const carId: string = 'any_car_id';
  const queryTemplate: string = '3333';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: QueryFinesDomain,
          useClass: QueryFinesUseCase,
        },
        {
          provide: QueryFinesHelper,
          useClass: QueryFinesHelper,
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
          provide: CurrencyUtil,
          useValue: {
            numToCurrency: jest.fn().mockReturnValue({ toFormat: jest.fn().mockReturnValue('R$ 10,99') }),
          },
        },
        {
          provide: DateTimeUtil,
          useValue: {
            fromDate: jest.fn().mockReturnValue({ format: jest.fn().mockReturnValue('10/10/2020') }),
          },
        },
      ],
    }).compile();

    myCarsQueryHelper = module.get(MyCarsQueryHelper);
  });

  beforeEach(async () => {
    sut = await module.resolve(QueryFinesDomain);
  });

  describe('#execute', () => {
    test('should call getCar one time with userId and CarId', async () => {
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
