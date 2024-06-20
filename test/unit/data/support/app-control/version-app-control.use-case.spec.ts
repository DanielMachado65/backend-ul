import { Test, TestingModule } from '@nestjs/testing';

import { VersionAppContolUseCase } from 'src/data/support/app-control/version-app-control.use-case';
import { DeviceTypeVersionAppControl } from 'src/domain/_entity/version-app.control.entity';
import {
  VersionAppContolResponseDto,
  VersionAppControlDto,
  VersionAppControlInputDto,
} from 'src/domain/_layer/data/dto/version-app-control.dto';
import { VersionAppControlRepository } from 'src/domain/_layer/infrastructure/repository/version-app-control';
import {
  VersionAppContolDomain,
  VersionAppContolResult,
} from 'src/domain/support/app-control/version-app-control.domain';

describe('VersionAppContolUseCase', () => {
  let sut: VersionAppContolUseCase;
  let module: TestingModule;
  let versionAppControlRepository: VersionAppControlRepository;

  const input: VersionAppControlInputDto = {
    currentAppVersion: '1.1.1',
    storeVersion: '1.2.1',
    operatingSystem: 'android',
  };

  const repositoryResponse: VersionAppControlDto = {
    deviceType: DeviceTypeVersionAppControl.ANDROID,
    currentVersion: '1.1.0',
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: VersionAppContolDomain,
          useClass: VersionAppContolUseCase,
        },
        {
          provide: VersionAppControlRepository,
          useValue: {
            getByDeviceType: jest.fn(),
          },
        },
      ],
    }).compile();

    versionAppControlRepository = module.get(VersionAppControlRepository);
  });

  beforeEach(async () => {
    sut = await module.resolve(VersionAppContolDomain);
  });

  describe('#validate', () => {
    test('should return false if device is bigger then app version', async () => {
      jest.spyOn(versionAppControlRepository, 'getByDeviceType').mockResolvedValueOnce({
        ...repositoryResponse,
        currentVersion: '1.0.0',
      });

      const response: VersionAppContolResult = await sut.validate({ ...input, currentAppVersion: '1.1.0' }).safeRun();
      const right: VersionAppContolResponseDto = response.getRight();

      expect(right.isForceUpgrade).toStrictEqual(false);
    });

    test('should return true if device is less then app version', async () => {
      jest.spyOn(versionAppControlRepository, 'getByDeviceType').mockResolvedValueOnce({
        ...repositoryResponse,
        currentVersion: '1.0.0',
      });

      const response: VersionAppContolResult = await sut.validate({ ...input, currentAppVersion: '0.9.1' }).safeRun();
      const right: VersionAppContolResponseDto = response.getRight();

      expect(right.isForceUpgrade).toStrictEqual(true);
    });

    test('should return false if device is equal app version', async () => {
      jest.spyOn(versionAppControlRepository, 'getByDeviceType').mockResolvedValueOnce({
        ...repositoryResponse,
        currentVersion: '1.0.0',
      });

      const response: VersionAppContolResult = await sut.validate({ ...input, currentAppVersion: '1.0.0' }).safeRun();
      const right: VersionAppContolResponseDto = response.getRight();

      expect(right.isForceUpgrade).toStrictEqual(false);
    });

    test('should return false if device is not found', async () => {
      jest.spyOn(versionAppControlRepository, 'getByDeviceType').mockResolvedValueOnce(null);

      const response: VersionAppContolResult = await sut.validate({ ...input, currentAppVersion: '1.0.0' }).safeRun();
      const right: VersionAppContolResponseDto = response.getRight();

      expect(right.isForceUpgrade).toStrictEqual(false);
    });

    test('should call getByDeviceType one time with android device', async () => {
      jest.spyOn(versionAppControlRepository, 'getByDeviceType').mockResolvedValueOnce(repositoryResponse);

      await sut.validate({ ...input, operatingSystem: DeviceTypeVersionAppControl.ANDROID }).safeRun();

      expect(versionAppControlRepository.getByDeviceType).toHaveBeenCalledTimes(1);
      expect(versionAppControlRepository.getByDeviceType).toHaveBeenCalledWith(DeviceTypeVersionAppControl.ANDROID);
    });

    test('should call getByDeviceType one time with ios device', async () => {
      jest.spyOn(versionAppControlRepository, 'getByDeviceType').mockResolvedValueOnce(repositoryResponse);

      await sut.validate({ ...input, operatingSystem: DeviceTypeVersionAppControl.IOS }).safeRun();

      expect(versionAppControlRepository.getByDeviceType).toHaveBeenCalledTimes(1);
      expect(versionAppControlRepository.getByDeviceType).toHaveBeenCalledWith(DeviceTypeVersionAppControl.IOS);
    });
  });
});
