import { QueryResponseStatus } from 'src/domain/_entity/query-response.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { TestDriveQueryStatus } from 'src/domain/_entity/test-drive-query.entity';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { TestDriveQueryDto } from 'src/domain/_layer/data/dto/test-drive-query.dto';
import { ResponseTestDriveDomain } from 'src/domain/core/query/v2/response-test-drive.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

const queryResponseMock = (params: Partial<QueryResponseDto> = {}): QueryResponseDto => ({
  id: 'any_query_response_id',
  queryRef: params.queryRef || 'any_query_ref',
  applicationId: 'any_application_id',
  keys: {
    plate: 'any_plate',
  },
  templateQueryId: 'any_template_query_id',
  templateQueryRef: 'any_template_query_ref',
  servicesToReprocess: [],
  status: params.status || QueryResponseStatus.SUCCESS,
  response: {},
});

describe(ResponseTestDriveDomain.name, () => {
  const setup: TestSetup<ResponseTestDriveDomain> = TestSetup.run(ResponseTestDriveDomain);
  jest.setTimeout(999999999);

  test('should call QueryRequestService.parseTestDriveResponse with correct params', async () => {
    const parserSpy: jest.SpyInstance = jest.spyOn(setup.servicesMocks.queryRequestService, 'parseTestDriveResponse');
    const insertedTestDrive: TestDriveQueryDto = await setup.factory.createEmptyTestDrive();
    const queryresponse: QueryResponseDto = queryResponseMock({ queryRef: insertedTestDrive.id });

    await setup.useCase.responseTestDrive(queryresponse).unsafeRun();

    expect(parserSpy).toBeCalledTimes(1);
    expect(parserSpy).toBeCalledWith(queryresponse);
  });

  test('should call TestDriveQueryRepository.updateById with status FAILURE if QueryRequestService.parseTestDriveResponse throws', async () => {
    const error: Error = new Error('parser_error');
    jest.spyOn(setup.servicesMocks.queryRequestService, 'parseTestDriveResponse').mockImplementationOnce(() => {
      throw error;
    });

    const insertedTestDrive: TestDriveQueryDto = await setup.factory.createEmptyTestDrive();

    const queryresponse: QueryResponseDto = queryResponseMock({ queryRef: insertedTestDrive.id });

    const updateSpy: jest.SpyInstance = jest.spyOn(setup.repositories.testDriveQuery, 'updateById');

    await setup.useCase.responseTestDrive(queryresponse).unsafeRun();

    expect(updateSpy).toBeCalledTimes(1);
    expect(updateSpy).toBeCalledWith(queryresponse.queryRef, {
      queryStatus: TestDriveQueryStatus.FAILURE,
      status: false,
      responseJson: null,
      executionTime: expect.any(Number),
    });
  });

  test('should call TestDriveQueryRepository.updateById with QueryResponse data and status success', async () => {
    const updateSpy: jest.SpyInstance = jest.spyOn(setup.repositories.testDriveQuery, 'updateById');
    const insertedTestDrive: TestDriveQueryDto = await setup.factory.createEmptyTestDrive();
    const queryresponse: QueryResponseDto = queryResponseMock({ queryRef: insertedTestDrive.id });

    await setup.useCase.responseTestDrive(queryresponse).unsafeRun();

    expect(updateSpy).toBeCalledTimes(1);
    expect(updateSpy).toBeCalledWith(insertedTestDrive.id, {
      queryStatus: TestDriveQueryStatus.SUCCESS,
      status: true,
      executionTime: expect.any(Number),
      responseJson: expect.any(Object),
    });
  });

  test('should call TestDriveQueryRepository.updateById with QueryResponse data and status failure', async () => {
    const updateSpy: jest.SpyInstance = jest.spyOn(setup.repositories.testDriveQuery, 'updateById');
    const insertedTestDrive: TestDriveQueryDto = await setup.factory.createEmptyTestDrive();
    const queryresponse: QueryResponseDto = queryResponseMock({
      queryRef: insertedTestDrive.id,
      status: QueryResponseStatus.FAILED,
    });

    await setup.useCase.responseTestDrive(queryresponse).unsafeRun();

    expect(updateSpy).toBeCalledTimes(1);
    expect(updateSpy).toBeCalledWith(insertedTestDrive.id, {
      queryStatus: TestDriveQueryStatus.FAILURE,
      executionTime: expect.any(Number),
      responseJson: expect.any(Object),
      status: false,
    });
  });

  test('should throw if TestDriveQueryRepository.updateById throws', async () => {
    jest.spyOn(setup.repositories.testDriveQuery, 'updateById').mockRejectedValueOnce(new Error('any_error'));

    const insertedTestDrive: TestDriveQueryDto = await setup.factory.createEmptyTestDrive();
    const queryresponse: QueryResponseDto = queryResponseMock({
      queryRef: insertedTestDrive.id,
      status: QueryResponseStatus.FAILED,
    });

    const promise: Promise<void> = setup.useCase.responseTestDrive(queryresponse).unsafeRun();

    await expect(promise).rejects.toThrow(UnknownDomainError);
  });
});
