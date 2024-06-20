import { SendQueryToMarketingDomain } from 'src/domain/support/marketing/send-query-to-marketing.domain';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(SendQueryToMarketingDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<SendQueryToMarketingDomain> = TestSetup.run(SendQueryToMarketingDomain);

  test('Send query to marketing', async () => {
    /** - Setup - */
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements();
    const insertedQuery: QueryDto = await setup.factory.createEmptyQuery({
      userId: insertedUser.id,
      responseJson: {
        debitosMultas: {
          noDebts: false,
          debitos: [],
        },
      }, // noDebts needs to be false
    });

    const spyRegisterQuery: jest.SpyInstance = jest
      .spyOn(setup.servicesMocks.markintingService, 'registerQuery')
      .mockImplementation(() => null);
    const spyRegisterIsHasDabits: jest.SpyInstance = jest
      .spyOn(setup.servicesMocks.markintingService, 'registerIsHasDabits')
      .mockImplementation(() => null);

    /** - Run - */
    const hasResulted: boolean = await setup.useCase.send(insertedQuery.id).unsafeRun();

    /** - Test - */
    expect(hasResulted).toBe(true);
    expect(spyRegisterQuery.mock.calls.length).toBe(1);
    expect(spyRegisterIsHasDabits.mock.calls.length).toBe(0);
  });

  test('Send query to marketing with debts', async () => {
    /** - Setup - */
    const insertedUser: UserDto = await setup.factory.createUserWithOnlyRequirements();
    const insertedQuery: QueryDto = await setup.factory.createEmptyQuery({
      userId: insertedUser.id,
      responseJson: {
        debitosMultas: {
          noDebts: false,
          debitos: [{ valorTotalEmCentavos: 10_00 }],
        },
      }, // noDebts needs to be false
    });

    const spyRegisterQuery: jest.SpyInstance = jest
      .spyOn(setup.servicesMocks.markintingService, 'registerQuery')
      .mockImplementation(() => null);
    const spyRegisterIsHasDabits: jest.SpyInstance = jest
      .spyOn(setup.servicesMocks.markintingService, 'registerIsHasDabits')
      .mockImplementation(() => null);

    /** - Run - */
    const hasResulted: boolean = await setup.useCase.send(insertedQuery.id).unsafeRun();

    /** - Test - */
    expect(hasResulted).toBe(true);
    expect(spyRegisterQuery.mock.calls.length).toBe(1);
    expect(spyRegisterIsHasDabits.mock.calls.length).toBe(1);
  });
});
