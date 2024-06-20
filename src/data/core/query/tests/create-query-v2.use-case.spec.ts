import { QueryComposeStatus } from 'src/domain/_entity/query-composer.entity';
import { QueryDocumentType, QueryStatus } from 'src/domain/_entity/query.entity';
import { QueryDuplicatedDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { PriceTableDto } from 'src/domain/_layer/data/dto/price-table.dto';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { ServiceDto } from 'src/domain/_layer/data/dto/service.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { CreateQueryV2Domain } from 'src/domain/core/query/v2/create-query-v2.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(CreateQueryV2Domain.name, () => {
  let insertedService: ServiceDto;
  let insertedQueryComposer: QueryComposerDto;
  let insertedPriceTable: PriceTableDto;

  /** - Setup - */
  const setup: TestSetup<CreateQueryV2Domain> = TestSetup.run(CreateQueryV2Domain);

  jest.setTimeout(999999999);

  beforeEach(async () => {
    insertedService = await setup.factory.createEmptyService({ code: 1 }); // cant be 0 since its falsy

    // query composer
    insertedQueryComposer = await setup.factory.createEmptyQueryComposer({
      status: QueryComposeStatus.ACTIVATED,
      name: 'Name',
      queryCode: insertedService.code,
      serviceIds: [insertedService.id],
    });

    // pricetable
    insertedPriceTable = await setup.factory.createEmptyPriceTable({
      template: [
        {
          queryCode: insertedQueryComposer.queryCode,
          queryComposerId: insertedQueryComposer.id,
          totalPriceCents: 0,
          oldPriceCents: 0,
        },
      ],
    });
  });

  test('should return QueryDuplicatedDomainError if query is duplicated if flag mayDuplicate is false', async () => {
    // user
    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      billing: { priceTableId: insertedPriceTable.id },
    });

    await setup.useCase
      .createQuery(insertedUser.id, insertedQueryComposer.queryCode, { plate: 'ABC1234' }, false)
      .unsafeRun();

    const duplicatedQuery: Promise<QueryDto> = setup.useCase
      .createQuery(insertedUser.id, insertedQueryComposer.queryCode, { plate: 'ABC1234' }, false)
      .unsafeRun();

    await expect(duplicatedQuery).rejects.toThrow(QueryDuplicatedDomainError);
  });

  test('should return a QueryDto if query is duplicated and flag mayDuplicate is true', async () => {
    // user
    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      billing: { priceTableId: insertedPriceTable.id },
    });

    await setup.useCase
      .createQuery(insertedUser.id, insertedQueryComposer.queryCode, { plate: 'ABC1234' }, true)
      .unsafeRun();

    const duplicatedQuery: QueryDto = await setup.useCase
      .createQuery(insertedUser.id, insertedQueryComposer.queryCode, { plate: 'ABC1234' }, true)
      .unsafeRun();

    expect(duplicatedQuery).toStrictEqual({
      createdAt: expect.any(String),
      documentQuery: 'ABC1234',
      documentType: 'PLACA',
      executionTime: 0,
      failedServices: [],
      id: expect.any(String),
      logId: expect.any(String),
      queryCode: insertedQueryComposer.queryCode,
      queryKeys: {
        address: {
          city: null,
          complement: null,
          neighborhood: null,
          numberEnd: null,
          numberStart: null,
          state: null,
          street: null,
          zipCode: null,
        },
        birthDate: null,
        chassis: null,
        cnpj: null,
        cpf: null,
        email: null,
        engine: null,
        gender: null,
        motherName: null,
        name: null,
        phone: null,
        plate: 'ABC1234',
        renavam: null,
        state: null,
      },
      refClass: insertedQueryComposer.name,
      reprocessedFromQueryId: null,
      responseJson: undefined,
      stackResult: [],
      status: QueryStatus.PENDING,
      queryStatus: QueryStatus.PENDING,
      reprocess: {
        lastRetryAt: null,
        requeryTries: 2,
      },
      userId: insertedUser.id,
      version: 2,
      rules: [],
    });
  });

  test('should update status of Query to FAILURE if process query throws', async () => {
    const error: Error = new Error('request_error');
    jest.spyOn(setup.servicesMocks.queryRequestService, 'requestQuery').mockRejectedValueOnce(error);

    const queryRepositorySpy: jest.SpyInstance = jest.spyOn(setup.repositories.query, 'updateById');

    // user
    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      billing: { priceTableId: insertedPriceTable.id },
    });

    const queryDto: Promise<QueryDto> = setup.useCase
      .createQuery(insertedUser.id, insertedQueryComposer.queryCode, { plate: 'ABC1234' }, false)
      .unsafeRun();

    await expect(queryDto).rejects.toThrow(UnknownDomainError);

    // expect(queryRepositorySpy).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
    expect(queryRepositorySpy).toHaveBeenNthCalledWith(2, expect.any(String), {
      executionTime: expect.any(Number),
      status: QueryStatus.FAILURE,
      queryStatus: QueryStatus.FAILURE,
    });
  });

  test('should get documentType with PLATE', async () => {
    // userasync async async
    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      billing: { priceTableId: insertedPriceTable.id },
    });

    const result: QueryDto = await setup.useCase
      .createQuery(
        insertedUser.id,
        insertedQueryComposer.queryCode,
        { plate: 'ABC1234', chassis: null, engine: null },
        true,
      )
      .unsafeRun();

    expect(result).toStrictEqual({
      createdAt: expect.any(String),
      documentQuery: 'ABC1234',
      documentType: QueryDocumentType.PLATE,
      executionTime: 0,
      failedServices: [],
      id: expect.any(String),
      logId: expect.any(String),
      queryCode: insertedQueryComposer.queryCode,
      queryKeys: expect.any(Object),
      refClass: insertedQueryComposer.name,
      reprocessedFromQueryId: null,
      responseJson: undefined,
      stackResult: [],
      status: QueryStatus.PENDING,
      queryStatus: QueryStatus.PENDING,
      reprocess: {
        lastRetryAt: null,
        requeryTries: 2,
      },
      userId: insertedUser.id,
      version: 2,
      rules: [],
    });
  });

  test('should get documentType with CHASSIS', async () => {
    // userasync async async
    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      billing: { priceTableId: insertedPriceTable.id },
    });

    const result: QueryDto = await setup.useCase
      .createQuery(insertedUser.id, insertedQueryComposer.queryCode, { plate: null, chassis: 'any_chassis' }, true)
      .unsafeRun();

    expect(result).toStrictEqual({
      createdAt: expect.any(String),
      documentQuery: 'any_chassis',
      documentType: QueryDocumentType.CHASSIS,
      executionTime: 0,
      failedServices: [],
      id: expect.any(String),
      logId: expect.any(String),
      queryCode: insertedQueryComposer.queryCode,
      queryKeys: expect.any(Object),
      refClass: insertedQueryComposer.name,
      reprocessedFromQueryId: null,
      responseJson: undefined,
      stackResult: [],
      status: QueryStatus.PENDING,
      queryStatus: QueryStatus.PENDING,
      reprocess: {
        lastRetryAt: null,
        requeryTries: 2,
      },
      userId: insertedUser.id,
      version: 2,
      rules: [],
    });
  });

  test('should get documentType with ENGINE', async () => {
    // userasync async async
    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      billing: { priceTableId: insertedPriceTable.id },
    });

    const result: QueryDto = await setup.useCase
      .createQuery(
        insertedUser.id,
        insertedQueryComposer.queryCode,
        { plate: null, chassis: null, engine: 'any_engine' },
        true,
      )
      .unsafeRun();

    expect(result).toStrictEqual({
      createdAt: expect.any(String),
      documentQuery: 'any_engine',
      documentType: QueryDocumentType.ENGINE,
      executionTime: 0,
      failedServices: [],
      id: expect.any(String),
      logId: expect.any(String),
      queryCode: insertedQueryComposer.queryCode,
      queryKeys: expect.any(Object),
      refClass: insertedQueryComposer.name,
      reprocessedFromQueryId: null,
      responseJson: undefined,
      stackResult: [],
      status: QueryStatus.PENDING,
      queryStatus: QueryStatus.PENDING,
      reprocess: {
        lastRetryAt: null,
        requeryTries: 2,
      },
      userId: insertedUser.id,
      version: 2,
      rules: [],
    });
  });

  test('should get documentType with CPF', async () => {
    // userasync async async
    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      billing: { priceTableId: insertedPriceTable.id },
    });

    const result: QueryDto = await setup.useCase
      .createQuery(
        insertedUser.id,
        insertedQueryComposer.queryCode,
        { plate: null, chassis: null, engine: null, cnpj: null, cpf: 'any_cpf' },
        true,
      )
      .unsafeRun();

    expect(result).toStrictEqual({
      createdAt: expect.any(String),
      documentQuery: 'any_cpf',
      documentType: QueryDocumentType.CPF,
      executionTime: 0,
      failedServices: [],
      id: expect.any(String),
      logId: expect.any(String),
      queryCode: insertedQueryComposer.queryCode,
      queryKeys: expect.any(Object),
      refClass: insertedQueryComposer.name,
      reprocessedFromQueryId: null,
      responseJson: undefined,
      stackResult: [],
      status: QueryStatus.PENDING,
      queryStatus: QueryStatus.PENDING,
      reprocess: {
        lastRetryAt: null,
        requeryTries: 2,
      },
      userId: insertedUser.id,
      version: 2,
      rules: [],
    });
  });

  test('should get documentType with CNPJ', async () => {
    // userasync async async
    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      billing: { priceTableId: insertedPriceTable.id },
    });

    const result: QueryDto = await setup.useCase
      .createQuery(
        insertedUser.id,
        insertedQueryComposer.queryCode,
        { plate: null, chassis: null, engine: null, cnpj: 'any_cnpj', cpf: null },
        true,
      )
      .unsafeRun();

    expect(result).toStrictEqual({
      createdAt: expect.any(String),
      documentQuery: 'any_cnpj',
      documentType: QueryDocumentType.CNPJ,
      executionTime: 0,
      failedServices: [],
      id: expect.any(String),
      logId: expect.any(String),
      queryCode: insertedQueryComposer.queryCode,
      queryKeys: expect.any(Object),
      refClass: insertedQueryComposer.name,
      reprocessedFromQueryId: null,
      responseJson: undefined,
      stackResult: [],
      status: QueryStatus.PENDING,
      queryStatus: QueryStatus.PENDING,
      reprocess: {
        lastRetryAt: null,
        requeryTries: 2,
      },
      userId: insertedUser.id,
      version: 2,
      rules: [],
    });
  });
});
