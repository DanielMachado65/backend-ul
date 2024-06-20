import { GetCreditPacksDomain } from 'src/domain/core/product/get-credit-packs.domain';
import { PackageEntity } from 'src/domain/_entity/package.entity';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(GetCreditPacksDomain.name, () => {
  const setup: TestSetup<GetCreditPacksDomain> = TestSetup.run(GetCreditPacksDomain);
  jest.setTimeout(999999999);

  test('Get all credit packages from filled repository', async () => {
    /** - Run - */
    const lengthTruthy: number = 10;

    const truthyOnes: ReadonlyArray<PackageEntity> = await setup.factory
      .__generateMany__(lengthTruthy)
      .createEmptyPackage({ status: true });

    await setup.factory.__generateMany__(10).createEmptyPackage({ status: false });

    const gotPacks: ReadonlyArray<PackageEntity> = await setup.useCase.getCreditPacks().unsafeRun();

    /** - Test - */
    expect(gotPacks).toEqual(expect.arrayContaining([...truthyOnes]));
    expect(truthyOnes).toEqual(expect.arrayContaining([...gotPacks]));
    expect(gotPacks).toHaveLength(lengthTruthy);
  });

  /** OPEN HANDLE JEST ERROR */
  test('Get all credit packages from empty repository', async () => {
    /** - Run - */
    const gotPacks: ReadonlyArray<PackageEntity> = await setup.useCase.getCreditPacks().unsafeRun();

    /** - Test - */
    expect(gotPacks).toHaveLength(0);
  });
});
