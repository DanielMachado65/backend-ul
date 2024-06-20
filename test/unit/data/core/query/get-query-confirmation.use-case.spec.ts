import { Test, TestingModule } from '@nestjs/testing';

import { MyCarsQueryHelper } from 'src/data/core/product/my-cars-query.helper';
import { GetQueryConfirmationUseCase } from 'src/data/core/query/get-query-confirmation.use-case';
import { QueryConfirmationDto } from 'src/domain/_layer/data/dto/query-confirmation.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { VehicleImageService } from 'src/domain/_layer/infrastructure/service/vehicle-image.service';
import {
  GetQueryConfirmationDomain,
  QueryConfirmationResult,
} from 'src/domain/core/query/get-query-confirmation.domain';

describe('GetQueryConfirmationUseCase', () => {
  let sut: GetQueryConfirmationUseCase;
  let module: TestingModule;
  let userRepository: UserRepository;
  let vehicleImageService: VehicleImageService;
  let myCarsQueryHelper: MyCarsQueryHelper;

  const templateQuery: string = '2';
  const userId: string = 'any_user_id';
  const chassis: string = 'any_chassis';
  const plate: string = 'any_plate';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: GetQueryConfirmationDomain,
          useClass: GetQueryConfirmationUseCase,
        },
        {
          provide: MyCarsQueryHelper,
          useValue: {
            requestQuery: jest.fn().mockReturnValue(jest.fn()),
            getResponse: jest.fn().mockReturnValue(
              jest.fn().mockResolvedValue({
                response: {
                  aggregate: {
                    plate: plate,
                    chassis: chassis,
                    brand: 'any_brand',
                    model: 'any_model',
                  },
                  basicVehicle: {
                    fipeData: [
                      {
                        version: 'any_version',
                        fipeId: 123,
                      },
                    ],
                  },
                },
              }),
            ),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            getById: jest.fn().mockResolvedValue({
              email: 'any_email',
              name: 'any_name',
            }),
          },
        },
        {
          provide: VehicleImageService,
          useValue: {
            getImageForBrandName: jest.fn().mockResolvedValue({
              mainImageUrl: 'any_image',
            }),
          },
        },
      ],
    }).compile();

    sut = await module.resolve(GetQueryConfirmationDomain);
  });

  beforeEach(() => {
    myCarsQueryHelper = module.get(MyCarsQueryHelper);
    userRepository = module.get(UserRepository);
    vehicleImageService = module.get(VehicleImageService);
  });

  describe('#getQueryConfirmation', () => {
    test('should call requestQuery one time with template query', async () => {
      await sut.getQueryConfirmation({ plate }, userId).safeRun();

      expect(myCarsQueryHelper.requestQuery).toHaveBeenCalledTimes(1);
      expect(myCarsQueryHelper.requestQuery).toHaveBeenCalledWith(templateQuery);
    });

    test('should call getResponse one time', async () => {
      await sut.getQueryConfirmation({ plate }, userId).safeRun();

      expect(myCarsQueryHelper.getResponse).toHaveBeenCalledTimes(1);
    });

    test('should call get user by id one time with', async () => {
      await sut.getQueryConfirmation({ plate }, userId).safeRun();

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(userRepository.getById).toHaveBeenLastCalledWith(userId);
    });

    test('should call vheicle image one time with', async () => {
      await sut.getQueryConfirmation({ plate }, userId).safeRun();

      expect(vehicleImageService.getImageForBrandName).toHaveBeenCalledTimes(1);
      expect(vehicleImageService.getImageForBrandName).toHaveBeenLastCalledWith('any_brand');
    });

    test('should hide chassis if send query with plate', async () => {
      const result: QueryConfirmationResult = await sut.getQueryConfirmation({ plate }, userId).safeRun();
      const response: QueryConfirmationDto = result.getRight();

      expect(response.placa).toStrictEqual(plate);
      expect(response.chassi).toStrictEqual('any_*******');
      expect(response.marca).toStrictEqual('any_brand');
      expect(response.modelo).toStrictEqual('any_model');
      expect(response.marcaImagem).toStrictEqual('any_image');
      expect(response.versoes[0].fipeId).toStrictEqual('123');
      expect(response.versoes[0].name).toStrictEqual('any_version');
    });

    test('should show chassis if send query with chassis', async () => {
      const result: QueryConfirmationResult = await sut.getQueryConfirmation({ chassis }, userId).safeRun();
      const response: QueryConfirmationDto = result.getRight();

      expect(response.placa).toStrictEqual('-');
      expect(response.chassi).toStrictEqual(chassis);
      expect(response.marca).toStrictEqual('any_brand');
      expect(response.modelo).toStrictEqual('any_model');
      expect(response.marcaImagem).toStrictEqual('any_image');
      expect(response.versoes[0].fipeId).toStrictEqual('123');
      expect(response.versoes[0].name).toStrictEqual('any_version');
    });
  });
});
