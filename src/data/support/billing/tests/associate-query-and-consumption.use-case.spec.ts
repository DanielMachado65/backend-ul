import {
  AssociateQueryAndConsumptionDomain,
  AssociateQueryAndConsumptionIO,
} from 'src/domain/support/billing/associate-query-and-consumption.domain';
import { ConsumptionStatementDto } from 'src/domain/_layer/data/dto/consumption-statement.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(AssociateQueryAndConsumptionDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<AssociateQueryAndConsumptionDomain> = TestSetup.run(AssociateQueryAndConsumptionDomain);

  test('Association of consumption to a query', async () => {
    /** - Setup - */
    const queryDto: QueryDto = await setup.factory.createEmptyQuery();
    const insertedConsumptionStatement: ConsumptionStatementDto = await setup.factory.createEmptyConsumptionStatement();

    const associateQueryAndConsumptionIO: AssociateQueryAndConsumptionIO =
      await setup.useCase.associateQueryAndConsumption(insertedConsumptionStatement.id, queryDto.id);

    /** - Run - */
    const associateQueryAndConsumption: ConsumptionStatementDto = await associateQueryAndConsumptionIO.unsafeRun();

    /** - Test - */
    expect(associateQueryAndConsumption).toBeDefined();
    expect(associateQueryAndConsumption.queryId).toBe(queryDto.id);
  });

  test("Association of consumption to a query that doesn't exist", async () => {
    /** - Setup - */
    const queryId: string = TestUtil.generateId();
    const consumptionId: string = TestUtil.generateId();
    const associateQueryAndConsumptionIO: AssociateQueryAndConsumptionIO =
      await setup.useCase.associateQueryAndConsumption(consumptionId, queryId);

    /** - Run - */
    const associateQueryAndConsumptionPromise: Promise<ConsumptionStatementDto> =
      associateQueryAndConsumptionIO.unsafeRun();

    /** - Test - */
    await expect(associateQueryAndConsumptionPromise).rejects.toThrow();
  });
});
