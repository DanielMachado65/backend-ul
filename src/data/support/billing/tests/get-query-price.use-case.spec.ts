import { QueryPriceTableTemplateItem } from 'src/domain/_entity/query-price-table.entity';
import { NoPriceTableFoundDomainError } from 'src/domain/_entity/result.error';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { PriceTableDto } from 'src/domain/_layer/data/dto/price-table.dto';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { GetQueryPriceDomain } from 'src/domain/support/billing/get-query-price.domain';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(GetQueryPriceDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<GetQueryPriceDomain> = TestSetup.run(GetQueryPriceDomain);

  test('Getting query price from a user price table', async () => {
    /** - Setup - */
    const composer: QueryComposerDto = await setup.factory.createEmptyQueryComposer({
      queryCode: 1,
      name: 'Composer 1',
    });
    const template: QueryPriceTableTemplateItem = {
      queryCode: composer.queryCode,
      totalPriceCents: 10_000,
      oldPriceCents: 5_000,
      queryComposerId: composer.id,
    };
    const insertedPriceTable: PriceTableDto = await setup.factory.createEmptyPriceTable({ template: [template] });
    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      billing: { priceTableId: insertedPriceTable.id },
    });

    /** - Run - */
    const queryPrice: QueryPriceTableTemplateItem = await setup.useCase
      .getQueryPrice(template.queryCode, insertedUser.id)
      .unsafeRun();

    /** - Test - */
    expect(queryPrice).toMatchObject({ ...template, queryName: composer.name });
  });

  test('Getting query price from a non existing user price table', async () => {
    /** - Setup - */
    const userId: string = TestUtil.generateId();
    const template: QueryPriceTableTemplateItem = {
      queryCode: 1,
      totalPriceCents: 10_000,
      oldPriceCents: 5_000,
      queryComposerId: null,
    };
    await setup.factory.createEmptyPriceTable({ template: [template] });

    /** - Run - */
    const queryingPrice: Promise<QueryPriceTableTemplateItem> = setup.useCase
      .getQueryPrice(template.queryCode, userId)
      .unsafeRun();

    /** - Test - */
    await expect(queryingPrice).rejects.toThrow(NoPriceTableFoundDomainError); // NoUserFoundDomainError?
  });

  test('Getting query price from a existing user, but wrong query code', async () => {
    /** - Setup - */
    const targetQueryCode: number = -1;

    const insertedPriceTable: PriceTableDto = await setup.factory.createEmptyPriceTable();
    const [insertedUser]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      billing: { priceTableId: insertedPriceTable.id },
    });

    /** - Run - */
    const queryingPrice: Promise<QueryPriceTableTemplateItem> = setup.useCase
      .getQueryPrice(targetQueryCode, insertedUser.id)
      .unsafeRun();

    /** - Test - */
    await expect(queryingPrice).rejects.toThrow(NoPriceTableFoundDomainError);
  });
});
