import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Test, TestingModule } from '@nestjs/testing';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { VersionAppControlInputDto } from 'src/domain/_layer/data/dto/version-app-control.dto';

import { VersionAppContolDomain } from 'src/domain/support/app-control/version-app-control.domain';
import { AppControlContoller } from 'src/presentation/support/app-control/app-control.controller';

describe('AppControlContoller', () => {
  let sut: AppControlContoller;
  let module: TestingModule;
  let versionAppContolDomain: VersionAppContolDomain;

  const input: VersionAppControlInputDto = {
    currentAppVersion: '1.0.0',
    operatingSystem: '1.0.0',
    storeVersion: 'Android',
  };

  const defaultEither: EitherIO<UnknownDomainError, unknown> = EitherIO.of(UnknownDomainError.toFn(), () => null);

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: VersionAppContolDomain,
          useValue: {
            validate: jest.fn().mockReturnValue(defaultEither),
          },
        },
      ],
      controllers: [AppControlContoller],
    }).compile();

    versionAppContolDomain = module.get(VersionAppContolDomain);
  });

  beforeEach(async () => {
    sut = await module.resolve(AppControlContoller);
  });

  describe('#isForceUpgrade', () => {
    test('should call validate one time with body', async () => {
      await sut.isForceUpgrade(input);

      expect(versionAppContolDomain.validate).toHaveBeenCalledTimes(1);
      expect(versionAppContolDomain.validate).toHaveBeenCalledWith(input);
    });
  });
});
