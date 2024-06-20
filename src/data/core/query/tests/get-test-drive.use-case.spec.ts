import { Types } from 'mongoose';
import { mockTestDriveResponseJson } from 'src/data/core/query/tests/mocks/test-drive-response-json.mock';
import { GetTestDriveDomain } from 'src/domain/core/query/get-test-drive.domain';
import { QueryNotExistsError, UnknownDomainError } from 'src/domain/_entity/result.error';
import {
  TestDriveQueryResponseEntity,
  TestDriveQueryStatus,
  TestDriveResponse,
  TestDriveResponseJson,
} from 'src/domain/_entity/test-drive-query.entity';
import { TestDriveQueryDto } from 'src/domain/_layer/data/dto/test-drive-query.dto';
import { TestSetup } from 'src/infrastructure/testing/setup.test';
import { StringUtil } from 'src/infrastructure/util/string.util';

describe(GetTestDriveDomain.name, () => {
  const setup: TestSetup<GetTestDriveDomain> = TestSetup.run(GetTestDriveDomain);
  jest.setTimeout(999999999);

  test('should return a TestDriveQueryDto with characters of chassis and renavam hidden if responseJson is not null', async () => {
    const responseJson: TestDriveResponseJson = mockTestDriveResponseJson();
    const testDriveDto: TestDriveQueryDto = await setup.factory.createEmptyTestDrive({
      queryStatus: TestDriveQueryStatus.SUCCESS,
      responseJson,
    });

    const result: TestDriveQueryResponseEntity = await setup.useCase.getTestDrive(testDriveDto.id).unsafeRun();

    const { chassi, renavam, dadosBasicos, ...rest }: TestDriveResponse = result.responseJson;
    const hiddenChassis: string = StringUtil.hideValue(chassi, 4);
    const hiddenRenavam: string = StringUtil.hideValue(renavam, 4);

    expect(result.id).toBe(testDriveDto.id);
    expect(result.responseJson).toStrictEqual({
      chassi: hiddenChassis,
      renavam: hiddenRenavam,
      dadosBasicos: {
        ...dadosBasicos,
        chassi: hiddenChassis,
        renavam: hiddenRenavam,
      },
      ...rest,
    });
  });

  test('should return a TestDriveQueryDto without responseJson if responseJson is null', async () => {
    const testDriveDto: TestDriveQueryDto = await setup.factory.createEmptyTestDrive({
      queryStatus: TestDriveQueryStatus.SUCCESS,
      responseJson: null,
    });

    const result: TestDriveQueryResponseEntity = await setup.useCase.getTestDrive(testDriveDto.id).unsafeRun();

    expect(result.id).toBe(testDriveDto.id);
    expect(result.responseJson).toStrictEqual(null);
  });

  // test('should return a TestDriveQueryDto with default responseJson if responseJson is undefined', async () => {
  //   const testDriveDto: TestDriveQueryDto = await setup.factory.createEmptyTestDrive({
  //     queryStatus: TestDriveQueryStatus.SUCCESS,
  //     responseJson: null,
  //   });

  //   const result: TestDriveQueryDto = await setup.useCase.getTestDrive(testDriveDto.id).unsafeRun();

  //   expect(result.id).toBe(testDriveDto.id);
  //   expect(result.responseJson).toStrictEqual(null);

  //   const testDriveDto2: TestDriveQueryDto = await setup.factory.createEmptyTestDrive({
  //     queryStatus: TestDriveQueryStatus.SUCCESS,
  //     responseJson: undefined,
  //   });

  //   const result2: TestDriveQueryDto = await setup.useCase.getTestDrive(testDriveDto2.id).unsafeRun();

  //   expect(result2.id).toBe(testDriveDto2.id);
  //   expect(result2.responseJson).toStrictEqual({
  //     brandImageUrl: null,
  //     chassi: '********',
  //     codigoMarcaModelo: null,
  //     cotacaoSeguro: [],
  //     dadosBasicos: {
  //       anoFabricacao: null,
  //       anoModelo: null,
  //       chassi: '********',
  //       especie: null,
  //       marca: null,
  //       marcaModelo: null,
  //       modelo: null,
  //       numeroDeFotos: null,
  //       placa: null,
  //       possuiHistoricoKM: false,
  //       potencia: null,
  //       renavam: '********',
  //       tipoVeiculo: null,
  //     },
  //     fichaTecnica: [],
  //     numMotor: null,
  //     opiniaoDoDono: {},
  //     placa: null,
  //     renavam: '********',
  //     versoes: [],
  //   });
  // });

  test('should throw a QueryNotExistsError if TestDriveQueryRepository returns null', async () => {
    const id: string = new Types.ObjectId().toString();

    const result: Promise<TestDriveQueryResponseEntity> = setup.useCase.getTestDrive(id).unsafeRun();

    await expect(result).rejects.toThrow(QueryNotExistsError);
  });

  test('should throw an UnknownDomainError if TestDriveQueryRepository throws', async () => {
    const testDriveDto: TestDriveQueryDto = await setup.factory.createEmptyTestDrive({
      queryStatus: TestDriveQueryStatus.SUCCESS,
      responseJson: null,
    });

    jest.spyOn(setup.repositories.testDriveQuery, 'getById').mockRejectedValueOnce(new Error('get_error'));

    const result: Promise<TestDriveQueryResponseEntity> = setup.useCase.getTestDrive(testDriveDto.id).unsafeRun();

    await expect(result).rejects.toThrow(UnknownDomainError);
  });
});
