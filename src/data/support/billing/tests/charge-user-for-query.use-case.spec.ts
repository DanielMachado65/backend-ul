import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { ConsumptionStatementEntity } from 'src/domain/_entity/consumption-statement.entity';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { BalanceEntity } from 'src/domain/_entity/balance.entity';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { ChargeUserForQueryDomain } from 'src/domain/support/billing/charge-user-for-query.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';
import { PriceTableDto } from 'src/domain/_layer/data/dto/price-table.dto';

describe(ChargeUserForQueryDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<ChargeUserForQueryDomain> = TestSetup.run(ChargeUserForQueryDomain);

  test('Charging user for query', async () => {
    /** - Setup - */
    const initialBalanceAmount: number = 100_000;
    const chargeAmount: number = 50_000;
    const oldChargeAmount: number = 20_000;

    // query composer
    const insertedQueryComposer: QueryComposerDto = await setup.factory.createEmptyQueryComposer();

    // pricetable
    const insertedPricetable: PriceTableDto = await setup.factory.createEmptyPriceTable({
      template: [
        {
          queryCode: insertedQueryComposer.queryCode,
          totalPriceCents: chargeAmount,
          oldPriceCents: oldChargeAmount,
          queryComposerId: insertedQueryComposer.id,
        },
      ],
    });

    // user & billing
    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount({
        billing: {
          priceTableId: insertedPricetable.id,
          accountFundsCents: chargeAmount,
        },
      });

    // balance
    await setup.repositories.balance.insert({
      currentBalanceCents: initialBalanceAmount,
      userId: insertedUser.id,
    });

    // query
    const insertedQuery: QueryDto = await setup.factory.createEmptyQuery({
      userId: insertedUser.id,
      queryCode: insertedQueryComposer.queryCode,
    });

    // consumption statement
    const insertedConsumptionStatement: ConsumptionStatementEntity =
      await setup.repositories.consumptionStatement.insert({
        queryId: insertedQuery.id,
        isPaid: false,
        billingId: insertedBilling.id,
        queryCode: insertedQuery.queryCode,
      });

    // charge user for query
    const resultBalance: BalanceEntity = await setup.useCase
      .chargeUserForQuery(insertedUser.id, insertedQuery.queryCode)
      .unsafeRun();

    const gotConsumption: ConsumptionStatementEntity = await setup.repositories.consumptionStatement.getById(
      resultBalance.consumptionItemId,
    );

    /** - Test - */
    expect(insertedConsumptionStatement.isPaid).toBe(false);
    expect(gotConsumption.isPaid).toBe(true);
    expect(resultBalance.currentBalanceCents).toBe(initialBalanceAmount - chargeAmount);
  });
});
