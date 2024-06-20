import { GetServicesFromQueryComposerDomain } from 'src/domain/core/query/get-services-from-query-composer.domain';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { ServiceDto } from 'src/domain/_layer/data/dto/service.dto';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

function servicesToIds(services: ReadonlyArray<ServiceDto>): ReadonlyArray<string> {
  return services.map((service: ServiceDto) => service.id);
}

// custom tests
describe(GetServicesFromQueryComposerDomain.name, () => {
  /** - Setup - */
  jest.setTimeout(20_000);
  const setup: TestSetup<GetServicesFromQueryComposerDomain> = TestSetup.run(GetServicesFromQueryComposerDomain);

  test('Retreiving services by query composer id', async () => {
    /** - Setup - */
    const insertedService: ServiceDto = await setup.factory.createEmptyService();
    const insertedQueryComposer: QueryComposerDto = await setup.factory.createEmptyQueryComposer({
      serviceIds: [insertedService.id],
    });

    /** - Run - */
    const retrievedServices: ReadonlyArray<ServiceDto> = await setup.useCase
      .getServicesFromQueryComposer(insertedQueryComposer.id)
      .unsafeRun();

    /** - Test - */
    expect(retrievedServices).toContainEqual(insertedService);
  });

  test('Inserting and retrieving of services into repository', async () => {
    /** - Setup - */
    const insertedServices: ReadonlyArray<ServiceDto> = await setup.factory.__generateMany__(10).createEmptyService();
    const insertedQueryComposer: QueryComposerDto = await setup.factory.createEmptyQueryComposer({
      serviceIds: servicesToIds(insertedServices),
    });

    /** - Run - */
    const retrievedServices: ReadonlyArray<ServiceDto> = await setup.useCase
      .getServicesFromQueryComposer(insertedQueryComposer.id)
      .unsafeRun();

    /** - Test - */
    expect(retrievedServices).toHaveLength(insertedServices.length);
    expect(retrievedServices).toEqual(expect.arrayContaining([...insertedServices]));
  });

  test('Retreiving services by query composer id with a non-existent query composer id', async () => {
    /** - Setup - */
    const id: string = TestUtil.generateId();

    /** - Run - */
    const retrievedServices: ReadonlyArray<ServiceDto> = await setup.useCase
      .getServicesFromQueryComposer(id)
      .unsafeRun();

    /** - Test - */
    expect(retrievedServices).toHaveLength(0);
  });

  test('Deleting a service and retreiving services by query composer id', async () => {
    /** - Setup - */
    const insertedServices: ReadonlyArray<ServiceDto> = await setup.factory.__generateMany__(10).createEmptyService();
    const insertedQueryComposer: QueryComposerDto = await setup.factory.createEmptyQueryComposer({
      serviceIds: servicesToIds(insertedServices),
    });
    await setup.repositories.service.removeById(insertedServices[0].id);

    /** - Run - */
    const retrievedServices: ReadonlyArray<ServiceDto> = await setup.useCase
      .getServicesFromQueryComposer(insertedQueryComposer.id)
      .unsafeRun();

    /** - Test - */
    expect(retrievedServices).toHaveLength(insertedServices.length - 1);
    expect(retrievedServices).not.toContain(insertedServices[0]);
  });
});
