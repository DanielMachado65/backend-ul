import { BillingType } from 'src/domain/_entity/billing.entity';
import { ClientType } from 'src/domain/_entity/client.entity';
import { ConsumptionStatementEntity } from 'src/domain/_entity/consumption-statement.entity';
import { QueryComposeStatus } from 'src/domain/_entity/query-composer.entity';
import { BalanceDto } from 'src/domain/_layer/data/dto/balance.dto';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { ConsumptionStatementDto } from 'src/domain/_layer/data/dto/consumption-statement.dto';
import { PriceTableDto } from 'src/domain/_layer/data/dto/price-table.dto';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { ServiceDto } from 'src/domain/_layer/data/dto/service.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { RequestQueryV2Domain } from 'src/domain/core/query/v2/request-query-v2.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(RequestQueryV2Domain.name, () => {
  /** - Setup - */
  const setup: TestSetup<RequestQueryV2Domain> = TestSetup.run(RequestQueryV2Domain);

  test('Request query (user internal)', async () => {
    /** - Setup - */
    const initialBalanceAmount: number = 100_000;
    const chargeAmount: number = 50_000;

    // service
    const insertedService: ServiceDto = await setup.factory.createEmptyService({ code: 1 });

    // query composer
    const insertedQueryComposer: QueryComposerDto = await setup.factory.createEmptyQueryComposer({
      status: QueryComposeStatus.ACTIVATED,
      name: 'Name', // needed for refclass query
      queryCode: 10,
      serviceIds: [insertedService.id],
    });

    // pricetable
    const insertedPriceTable: PriceTableDto = await setup.factory.createEmptyPriceTable({
      template: [
        {
          queryCode: insertedQueryComposer.queryCode,
          queryComposerId: insertedQueryComposer.id,
          totalPriceCents: chargeAmount,
          oldPriceCents: chargeAmount,
        },
      ],
    });

    // user & billing
    const [insertedUser, insertedBilling]: readonly [UserDto, BillingDto] =
      await setup.factory.createEmptyUserWithBillingAccount({
        billing: {
          priceTableId: insertedPriceTable.id,
          accountFundsCents: chargeAmount,
          billingType: BillingType.PRE_PAID,
        },
      });

    // balance
    await setup.repositories.balance.insert({
      userId: insertedUser.id,
      currentBalanceCents: initialBalanceAmount,
    });

    // consumption statement
    const insertedConsumptionStatement: ConsumptionStatementDto = await setup.factory.createEmptyConsumptionStatement({
      queryId: insertedQueryComposer.id,
      isPaid: false,
      billingId: insertedBilling.id,
    });

    /** - Run - */
    const queryDto: QueryDto = await setup.useCase
      .requestQuery(
        'token',
        insertedUser.id,
        insertedQueryComposer.queryCode,
        { chassis: 'GodTier' },
        ClientType.WEBSITE,
        true,
      )
      .unsafeRun();
    const gotUpdatedBalanceUser: BalanceDto = await setup.repositories.balance.getUserLastBalance(insertedUser.id);
    const gotConsumption: ConsumptionStatementEntity = await setup.repositories.consumptionStatement.getById(
      gotUpdatedBalanceUser.consumptionItemId,
    );
    const resultBalance: BalanceDto = await setup.repositories.balance.getUserLastBalance(insertedUser.id);

    /** - Test - */
    expect(queryDto).toBeDefined();
    expect(insertedConsumptionStatement.isPaid).toBe(false);
    expect(resultBalance.currentBalanceCents).toBe(initialBalanceAmount - chargeAmount);
    expect(gotConsumption.isPaid).toBe(true);
  });
});
