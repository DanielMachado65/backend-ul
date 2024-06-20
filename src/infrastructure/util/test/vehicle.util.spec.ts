import { Test, TestingModule } from '@nestjs/testing';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { VehicleUtil } from 'src/infrastructure/util/vehicle.util';

describe(VehicleUtil.name, () => {
  let sut: VehicleUtil;
  let module: TestingModule;

  const amazonS3Url: string = 'any_s3_url';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        VehicleUtil,
        {
          provide: EnvService,
          useValue: {
            get: jest.fn().mockReturnValue(amazonS3Url),
          },
        },
      ],
    }).compile();
  });

  beforeAll(async () => {
    sut = await module.resolve(VehicleUtil);
  });

  test('should return a default url if brand is not mapped', () => {
    const brandUrl: string = sut.getBrandImgSrc('invalid_brand');

    expect(brandUrl).toBe(`${amazonS3Url}/brands/default.webp`);
  });

  test('should return the url from brand if it is mapped', () => {
    const brandUrl: string = sut.getBrandImgSrc('I/HARLEY-DAVIDSON');

    expect(brandUrl).toBe(`${amazonS3Url}/brands/harley-davidson.webp`);
  });

  test('should return a default url if brand if null', () => {
    const brandUrl: string = sut.getBrandImgSrc(null);

    expect(brandUrl).toBe(`${amazonS3Url}/brands/default.webp`);
  });
});
