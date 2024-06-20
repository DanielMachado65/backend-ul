import { QueryComposeStatus } from 'src/domain/_entity/query-composer.entity';
import { QueryPriceTableTemplateItem } from 'src/domain/_entity/query-price-table.entity';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { PriceTableDto } from 'src/domain/_layer/data/dto/price-table.dto';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { GetQueryComposerDomain } from 'src/domain/core/query/get-query-composer.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(GetQueryComposerDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<GetQueryComposerDomain> = TestSetup.run(GetQueryComposerDomain);
  jest.setTimeout(999999999);

  test('Adding queries composers and getting a selected composer', async () => {
    /** - Setup - */

    // query composer
    const insertedQueryComposer: QueryComposerDto = await setup.factory.createEmptyQueryComposer({
      status: QueryComposeStatus.ACTIVATED,
    });

    // template
    const priceTableTemplate: QueryPriceTableTemplateItem = {
      queryCode: insertedQueryComposer.queryCode,
      totalPriceCents: 10_000,
      oldPriceCents: 5_000,
      queryComposerId: insertedQueryComposer.id,
    };

    // price table
    const insertedPriceTable: PriceTableDto = await setup.factory.createEmptyPriceTable({
      template: [priceTableTemplate],
    });

    // user & billing
    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      billing: { priceTableId: insertedPriceTable.id },
    });

    const queryComposer: QueryComposerDto = await setup.useCase
      .getQueryComposer(insertedUser.id, insertedQueryComposer.queryCode)
      .unsafeRun();

    /** - Test - */
    expect(queryComposer).toStrictEqual(insertedQueryComposer);
  });
});
