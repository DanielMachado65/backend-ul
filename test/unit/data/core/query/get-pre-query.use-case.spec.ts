import { Test, TestingModule } from '@nestjs/testing';
import { GetPreQueryUseCase } from 'src/data/core/query/get-pre-query.use-case';
import { PreQueryDto } from 'src/domain/_layer/data/dto/pre-query.dto';
import { StaticDataService } from 'src/domain/_layer/infrastructure/service/static-data.service';
import { VehicleImageService } from 'src/domain/_layer/infrastructure/service/vehicle-image.service';
import { GetPreQueryDomain, GetPreQueryResult } from 'src/domain/core/query/get-pre-query.domain';

describe('GetPreQueryUseCase', () => {
  let sut: GetPreQueryUseCase;
  let module: TestingModule;
  let staticDataService: StaticDataService;
  let vehicleImageService: VehicleImageService;

  const output: PreQueryDto = {
    plate: 'any_plate',
    chassis: 'any_chassis',
    engineNumber: 'any_engine_number',
    brand: 'any_brand',
    model: 'any_model',
    brandImageUrl: 'any_brand_image_url',
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: GetPreQueryDomain,
          useClass: GetPreQueryUseCase,
        },
        {
          provide: StaticDataService,
          useValue: {
            getPreQuery: jest.fn().mockResolvedValue(output),
          },
        },
        {
          provide: VehicleImageService,
          useValue: {
            getImageForBrandName: jest.fn().mockResolvedValue({ mainImageUrl: output.brandImageUrl }),
          },
        },
      ],
    }).compile();

    sut = await module.resolve(GetPreQueryDomain);
  });

  beforeEach(() => {
    staticDataService = module.get(StaticDataService);
    vehicleImageService = module.get(VehicleImageService);
  });

  describe('#getPreQuery', () => {
    test('should call getPreQuery one time with input', async () => {
      const plate: string = 'any_plate';

      await sut.getPreQuery({ plate }).safeRun();

      expect(staticDataService.getPreQuery).toHaveBeenCalledTimes(1);
      expect(staticDataService.getPreQuery).toHaveBeenCalledWith({ plate });
    });

    test('should call getImageForBrandName one time with brand', async () => {
      const plate: string = 'any_plate';

      await sut.getPreQuery({ plate }).safeRun();

      expect(vehicleImageService.getImageForBrandName).toHaveBeenCalledTimes(1);
      expect(vehicleImageService.getImageForBrandName).toHaveBeenCalledWith(output.brand);
    });

    test('should get response', async () => {
      const plate: string = 'any_plate';

      const result: GetPreQueryResult = await sut.getPreQuery({ plate }).safeRun();
      expect(result.getRight()).toEqual({
        plate: plate,
        chassis: 'any_*******',
        engineNumber: 'an***************',
        brand: 'any_brand',
        model: 'any_model',
        brandImageUrl: 'any_brand_image_url',
      });
    });

    test('should not return chassis and engine if key is plate', async () => {
      const plate: string = 'any_plate';

      const result: GetPreQueryResult = await sut.getPreQuery({ plate }).safeRun();
      const response: PreQueryDto = result.getRight();

      expect(response.plate).toStrictEqual(plate);
      expect(response.chassis).toStrictEqual('any_*******');
      expect(response.engineNumber).toStrictEqual('an***************');
      expect(response.brand).toStrictEqual('any_brand');
      expect(response.model).toStrictEqual('any_model');
      expect(response.brandImageUrl).toStrictEqual('any_brand_image_url');
    });

    test('should not return plate and engine if key is chassis', async () => {
      const chassis: string = 'any_chassis';

      const result: GetPreQueryResult = await sut.getPreQuery({ chassis }).safeRun();
      const response: PreQueryDto = result.getRight();

      expect(response.plate).toStrictEqual('an*******');
      expect(response.chassis).toStrictEqual(chassis);
      expect(response.engineNumber).toStrictEqual('an***************');
      expect(response.brand).toStrictEqual('any_brand');
      expect(response.model).toStrictEqual('any_model');
      expect(response.brandImageUrl).toStrictEqual('any_brand_image_url');
    });

    test('should not return plate and chassis if key is engineNumber', async () => {
      const engineNumber: string = 'any_engine_number';

      const result: GetPreQueryResult = await sut.getPreQuery({ engineNumber }).safeRun();
      const response: PreQueryDto = result.getRight();

      expect(response.plate).toStrictEqual('an*******');
      expect(response.chassis).toStrictEqual('any_*******');
      expect(response.engineNumber).toEqual(engineNumber);
      expect(response.brand).toStrictEqual('any_brand');
      expect(response.model).toStrictEqual('any_model');
      expect(response.brandImageUrl).toStrictEqual('any_brand_image_url');
    });
  });
});
