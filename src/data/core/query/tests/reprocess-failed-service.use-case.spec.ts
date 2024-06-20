import { ReprocessFailedServiceDomain } from 'src/domain/core/query/reprocess-failed-service.domain';
import {
  NoServiceLogFoundDomainError,
  ProviderUnavailableDomainError,
  ServiceLogAlreadyReprocessingDomainError,
  TooManyServiceLogReprocessDomainError,
} from 'src/domain/_entity/result.error';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { ServiceLogDto } from 'src/domain/_layer/data/dto/service-log.dto';
import { ServiceDto } from 'src/domain/_layer/data/dto/service.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(ReprocessFailedServiceDomain.name, () => {
  /** - Setup - */
  jest.setTimeout(20_000);
  const setup: TestSetup<ReprocessFailedServiceDomain> = TestSetup.run(ReprocessFailedServiceDomain);

  const nowDate: Date = new Date(2020, 0, 0);
  const past15MinutesDate: Date = new Date(2019, 0, 0);

  beforeAll(() => {
    jest.useFakeTimers({
      now: nowDate,
      doNotFake: ['nextTick'],
    }); // modern freezes tests
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('Should reprocess failed service', async () => {
    /** - Setup - */

    // service
    const insertedService: ServiceDto = await setup.factory.createEmptyService();

    // user
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements();

    // service log
    const insertedServiceLog: ServiceLogDto = await setup.repositories.serviceLog.insert({
      logId: insertedUser.id,
      serviceCode: insertedService.code,
      createdAt: past15MinutesDate.toISOString(),
    });

    // query
    const insertedQuery: QueryDto = await setup.factory.createEmptyQuery({
      failedServices: [
        {
          serviceLogId: insertedServiceLog.id,
          serviceCode: insertedService.code,
          serviceName: 'Test',
          supplierCode: 10,
          amountToRetry: 3,
          lastRetryAt: past15MinutesDate.toISOString(),
        },
      ],
    });

    /** - Run - */
    const resultServiceLog: ServiceLogDto = await setup.useCase
      .reprocessFailedService(insertedQuery.id, insertedServiceLog.id)
      .unsafeRun();

    /** - Test - */
    expect(resultServiceLog).toBeDefined(); // needs more
  });

  test('Trying to reprocess failed service but provider is unavailable', async () => {
    /** - Setup - */

    // service
    const insertedService: ServiceDto = await setup.factory.createEmptyService();

    // user
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements();

    // service log
    const insertedServiceLog: ServiceLogDto = await setup.repositories.serviceLog.insert({
      logId: insertedUser.id,
      serviceCode: insertedService.code,
      createdAt: past15MinutesDate.toISOString(),
    });

    // query
    const insertedQuery: QueryDto = await setup.factory.createEmptyQuery({
      failedServices: [
        {
          serviceLogId: insertedServiceLog.id,
          serviceCode: insertedService.code,
          serviceName: 'Test',
          supplierCode: 10,
          amountToRetry: 3,
          lastRetryAt: past15MinutesDate.toISOString(),
        },
      ],
    });

    jest.spyOn(setup.servicesMocks.queryProviderService, 'processServices').mockReturnValue(null);

    /** - Run - */
    const resultingServiceLog: Promise<ServiceLogDto> = setup.useCase
      .reprocessFailedService(insertedQuery.id, insertedServiceLog.id)
      .unsafeRun();

    /** - Test - */
    await expect(resultingServiceLog).rejects.toThrow(ProviderUnavailableDomainError);
  });

  test('Trying to reprocess failed service but no service log', async () => {
    /** - Setup - */

    // service
    const insertedService: ServiceDto = await setup.factory.createEmptyService();

    // query
    const insertedQuery: QueryDto = await setup.factory.createEmptyQuery({
      failedServices: [
        {
          serviceLogId: null,
          serviceCode: insertedService.code,
          serviceName: 'Test',
          supplierCode: 10,
          amountToRetry: 3,
          lastRetryAt: nowDate.toISOString(),
        },
      ],
    });

    /** - Run - */
    const resultingServiceLog: Promise<ServiceLogDto> = setup.useCase
      .reprocessFailedService(insertedQuery.id, undefined)
      .unsafeRun();

    /** - Test - */
    await expect(resultingServiceLog).rejects.toThrow(NoServiceLogFoundDomainError);
  });

  test('Trying to reprocess failed service but client already reprocessed within 15 mins', async () => {
    /** - Setup - */

    // service
    const insertedService: ServiceDto = await setup.factory.createEmptyService();

    // user
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements();

    // service log
    const insertedServiceLog: ServiceLogDto = await setup.repositories.serviceLog.insert({
      logId: insertedUser.id,
      serviceCode: insertedService.code,
      createdAt: nowDate.toISOString(),
    });

    // query
    const insertedQuery: QueryDto = await setup.factory.createEmptyQuery({
      failedServices: [
        {
          serviceLogId: insertedServiceLog.id,
          serviceCode: insertedService.code,
          serviceName: 'Test',
          supplierCode: 10,
          amountToRetry: 3,
          lastRetryAt: nowDate.toISOString(),
        },
      ],
    });

    /** - Run - */
    const resultingServiceLog: Promise<ServiceLogDto> = setup.useCase
      .reprocessFailedService(insertedQuery.id, insertedServiceLog.id)
      .unsafeRun();

    /** - Test - */
    await expect(resultingServiceLog).rejects.toThrow(TooManyServiceLogReprocessDomainError);
  });

  test('Trying to reprocess failed service but service is already reprocessing', async () => {
    /** - Setup - */

    // service
    const insertedService: ServiceDto = await setup.factory.createEmptyService();

    // user
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements();

    // service log
    const insertedServiceLog: ServiceLogDto = await setup.repositories.serviceLog.insert({
      logId: insertedUser.id,
      serviceCode: insertedService.code,
      createdAt: past15MinutesDate.toISOString(),
      reprocessing: {
        isReprocessing: true,
        attemptsCount: 0,
        lastRetryAt: past15MinutesDate.toISOString(),
        originalServiceCode: insertedService.code,
      },
    });

    // query
    const insertedQuery: QueryDto = await setup.factory.createEmptyQuery({
      failedServices: [
        {
          serviceLogId: insertedServiceLog.id,
          serviceCode: insertedService.code,
          serviceName: 'Test',
          supplierCode: 10,
          amountToRetry: 3,
          lastRetryAt: past15MinutesDate.toISOString(),
        },
      ],
    });

    /** - Run - */
    const resultingServiceLog: Promise<ServiceLogDto> = setup.useCase
      .reprocessFailedService(insertedQuery.id, insertedServiceLog.id)
      .unsafeRun();

    /** - Test - */
    await expect(resultingServiceLog).rejects.toThrow(ServiceLogAlreadyReprocessingDomainError);
  });

  // [NoServiceFoundDomainError]
});
