import { ClientType } from 'src/domain/_entity/client.entity';
import { QueryRepresentationEntity } from 'src/domain/_entity/query-representation.entity';
import { NoQueryFoundDomainError } from 'src/domain/_entity/result.error';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { GetAlreadyDoneQueryDomain } from 'src/domain/core/query/get-already-done-query.domain';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe.skip(GetAlreadyDoneQueryDomain.name, () => {
  /** - Setup - */
  jest.setTimeout(20_000);
  const setup: TestSetup<GetAlreadyDoneQueryDomain> = TestSetup.run(GetAlreadyDoneQueryDomain);

  test('Insertion of query into repository and retrieving back with id', async () => {
    /** - Setup - */
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements();

    const insertedQuery: QueryDto = await setup.factory.createEmptyQuery({ userId: insertedUser.id });

    /** - Run - */
    const retrievedQueryDesktop: QueryRepresentationEntity = await setup.useCase
      .getAlreadyDoneQuery(insertedQuery.id, ClientType.WEBSITE)
      .unsafeRun();

    const retrievedQueryMobile: QueryRepresentationEntity = await setup.useCase
      .getAlreadyDoneQuery(insertedQuery.id, ClientType.MOBILE)
      .unsafeRun();

    /** - Test - */
    expect(retrievedQueryDesktop.code).toBe(insertedQuery.queryCode);
    expect(retrievedQueryMobile.code).toBe(insertedQuery.queryCode);
    expect(retrievedQueryDesktop.dsl.components[0].size).toBe('big');
    expect(retrievedQueryMobile.dsl.components[0].size).toBe('small');
  });

  test("Trying to retreive a query with a id that doesn't exist", async () => {
    /** - Setup - */
    const id: string = TestUtil.generateId();

    /** - Run - */
    const retrievedQueryIO: Promise<QueryRepresentationEntity> = setup.useCase
      .getAlreadyDoneQuery(id, ClientType.WEBSITE)
      .unsafeRun();

    /** - Test - */
    await expect(retrievedQueryIO).rejects.toThrow(NoQueryFoundDomainError);
  });
});
