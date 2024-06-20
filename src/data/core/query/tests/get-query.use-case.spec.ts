import { NoQueryFoundDomainError } from 'src/domain/_entity/result.error';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { GetQueryDomain } from 'src/domain/core/query/get-query.domain';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe.skip(GetQueryDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<GetQueryDomain> = TestSetup.run(GetQueryDomain);

  test('Saving and getting a query for test', async () => {
    /** - Setup - */
    const insertedQuery: QueryDto = await setup.factory.createEmptyQuery();

    /** - Run - */
    const gotQuery: QueryDto = await setup.useCase.getQuery(insertedQuery.id).unsafeRun();

    // tests
    expect(gotQuery).toMatchObject(insertedQuery);
  });

  test("Trying to get a query that doesn't exist", async () => {
    /** - Setup - */
    const id: string = TestUtil.generateId();

    /** - Run - */
    const gettingQuery: Promise<QueryDto> = setup.useCase.getQuery(id).unsafeRun();

    // tests
    await expect(gettingQuery).rejects.toThrow(NoQueryFoundDomainError);
  });
});
