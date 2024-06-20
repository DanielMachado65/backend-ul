import { QueryStatus } from 'src/domain/_entity/query.entity';
import {
  QuerWithoutFailedServicesError,
  QueryAlreadyReprocessingError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { ServiceDto } from 'src/domain/_layer/data/dto/service.dto';
import { ReprocessQueryDomain } from 'src/domain/core/query/v2/reprocess-query.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe('ReprocessQueryDomain.name', () => {
  const setup: TestSetup<ReprocessQueryDomain> = TestSetup.run(ReprocessQueryDomain);

  test('should return QuerWithoutFailedServicesError if has no failed services', async () => {
    const query: QueryDto = await setup.factory.createEmptyQuery({
      failedServices: [],
      status: QueryStatus.FAILURE,
      queryStatus: QueryStatus.FAILURE,
    });

    const promise: Promise<QueryDto> = setup.useCase.reprocessQuery(query.id).unsafeRun();

    await expect(promise).rejects.toThrow(QuerWithoutFailedServicesError);
  });

  test('should return QueryAlreadyReprocessingError if query already reprocessing', async () => {
    const service: ServiceDto = await setup.factory.createEmptyService();
    const query: QueryDto = await setup.factory.createEmptyQuery({
      failedServices: [
        {
          serviceCode: service.code,
          serviceName: service.name,
          supplierCode: service.supplier.code,
          amountToRetry: 2,
        },
      ],
      status: QueryStatus.REPROCESSING,
      queryStatus: QueryStatus.REPROCESSING,
    });

    const promise: Promise<QueryDto> = setup.useCase.reprocessQuery(query.id).unsafeRun();

    await expect(promise).rejects.toThrow(QueryAlreadyReprocessingError);
  });

  test('should call QueryRequestService with correct queryRef and update queryStatus to REPROCESSING', async () => {
    const queryRequestServiceSpy: jest.SpyInstance = jest.spyOn(
      setup.servicesMocks.queryRequestService,
      'reprocessQuery',
    );
    const service: ServiceDto = await setup.factory.createEmptyService();
    const query: QueryDto = await setup.factory.createEmptyQuery({
      failedServices: [
        {
          serviceCode: service.code,
          serviceName: service.name,
          supplierCode: service.supplier.code,
          amountToRetry: 2,
        },
      ],
      status: QueryStatus.SUCCESS,
      queryStatus: QueryStatus.SUCCESS,
    });

    const queryDto: QueryDto = await setup.useCase.reprocessQuery(query.id).unsafeRun();

    expect(queryDto).toStrictEqual({
      ...query,
      queryStatus: QueryStatus.REPROCESSING,
      failedServices: [],
      reprocess: {
        lastRetryAt: expect.any(Date),
        requeryTries: 1,
      },
    });

    expect(queryRequestServiceSpy).toHaveBeenCalledTimes(1);
    expect(queryRequestServiceSpy).toHaveBeenCalledWith({ queryRef: query.id });
  });

  test('should return a QueryDto with requeryTries -1', async () => {
    jest.spyOn(setup.servicesMocks.queryRequestService, 'reprocessQuery').mockRejectedValueOnce(new Error('any_error'));

    const service: ServiceDto = await setup.factory.createEmptyService();
    const query: QueryDto = await setup.factory.createEmptyQuery({
      failedServices: [
        {
          serviceCode: service.code,
          serviceName: service.name,
          supplierCode: service.supplier.code,
          amountToRetry: 2,
        },
      ],
      status: QueryStatus.SUCCESS,
      queryStatus: QueryStatus.SUCCESS,
    });

    const promise: Promise<QueryDto> = setup.useCase.reprocessQuery(query.id).unsafeRun();

    await expect(promise).rejects.toThrow(UnknownDomainError);

    const queryDto: QueryDto = await setup.repositories.query.getById(query.id);

    expect(queryDto).toStrictEqual({
      ...query,
      reprocess: {
        lastRetryAt: expect.any(Date),
        requeryTries: 1,
      },
    });
  });
});
