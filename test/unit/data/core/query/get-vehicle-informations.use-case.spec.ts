import { Test, TestingModule } from '@nestjs/testing';

import { GetVehicleInformationsUseCase } from 'src/data/core/query/get-vehicle-informations.use-case';
import { PlateIsRequiredError } from 'src/domain/_entity/result.error';
import { VehicleInformationsDto } from 'src/domain/_layer/data/dto/vehicle-informations.dto';
import { StaticDataService } from 'src/domain/_layer/infrastructure/service/static-data.service';
import { GetVehicleInformationsDomain } from 'src/domain/core/query/get-vehicle-informations.domain';

describe('GetVehicleInformationsUseCase', () => {
  let sut: GetVehicleInformationsUseCase;
  let module: TestingModule;
  let staticDataService: StaticDataService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: GetVehicleInformationsDomain,
          useClass: GetVehicleInformationsUseCase,
        },
        {
          provide: StaticDataService,
          useValue: {
            getInformationsByPlate: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = await module.resolve(GetVehicleInformationsDomain);
  });

  beforeEach(() => {
    staticDataService = module.get(StaticDataService);
  });

  describe('#execute', () => {
    test('should throw PlateIsRequiredError if plate is not send', async () => {
      const error: PlateIsRequiredError = new PlateIsRequiredError();
      const result: Promise<VehicleInformationsDto> = sut.execute({ plate: '' }).unsafeRun();

      expect(result).rejects.toEqual(error);
    });

    test('should call getInformationsByPlate one time with plate', async () => {
      const plate: string = 'ABC1234';
      await sut.execute({ plate }).safeRun();

      expect(staticDataService.getInformationsByPlate).toHaveBeenCalledTimes(1);
      expect(staticDataService.getInformationsByPlate).toHaveBeenCalledWith(plate);
    });
  });
});
