import * as mongoose from 'mongoose';
import { QueryComposeStatus } from 'src/domain/_entity/query-composer.entity';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { PriceTableDto } from 'src/domain/_layer/data/dto/price-table.dto';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { ServiceDto } from 'src/domain/_layer/data/dto/service.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { CreateQueryDomain } from 'src/domain/core/query/create-query.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe.skip(CreateQueryDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<CreateQueryDomain> = TestSetup.run(CreateQueryDomain);
  jest.setTimeout(999999999);

  test('Creating a query and getting back', async () => {
    /** - Setup - */

    // service
    const insertedService: ServiceDto = await setup.factory.createEmptyService({ code: 1 }); // cant be 0 since its falsy

    // query composer
    const insertedQueryComposer: QueryComposerDto = await setup.factory.createEmptyQueryComposer({
      status: QueryComposeStatus.ACTIVATED,
      name: 'Name',
      queryCode: insertedService.code,
      serviceIds: [insertedService.id],
    });

    // pricetable
    const insertedPriceTable: PriceTableDto = await setup.factory.createEmptyPriceTable({
      template: [
        {
          queryCode: insertedQueryComposer.queryCode,
          queryComposerId: insertedQueryComposer.id,
          totalPriceCents: 0,
          oldPriceCents: 0,
        },
      ],
    });

    // user
    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      billing: { priceTableId: insertedPriceTable.id },
    });

    mongoose.connections;

    /** - Run - */
    const createdQuery: QueryDto = await setup.useCase
      .createQuery(insertedUser.id, insertedQueryComposer.queryCode, {}, false)
      .unsafeRun();
    const gotQuery: QueryDto = await setup.repositories.query.getById(createdQuery.id);

    /** - Test - */
    expect(createdQuery).toBeDefined();
    expect(gotQuery).toBeDefined();
    expect(gotQuery).toMatchObject(createdQuery);
  });
});
