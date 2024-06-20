import { Test, TestingModule } from '@nestjs/testing';

import { QueryDatasheetUseCase } from 'src/data/core/product/query-datasheet.use-case';
import { MyCarProductStatusEnum } from 'src/domain/_entity/my-car-product.entity';
import { CarNotFoundError } from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { MyCarQueryDatasheet } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { QueryDatasheetDomain } from 'src/domain/core/product/query-datasheet.domain';

describe('QueryDatasheetUseCase', () => {
  let sut: QueryDatasheetDomain;
  let module: TestingModule;
  let myCarProductRepository: MyCarProductRepository;
  let queryRequestService: QueryRequestService;

  const userId: string = 'any_user_id';
  const carId: string = 'any_car_id';

  const carProductMock: Partial<MyCarProductWithUserDto> = {
    status: MyCarProductStatusEnum.ACTIVE,
    keys: {
      brand: 'any_brand',
      brandModelCode: 'any_brand_model_code',
      chassis: 'any_chassis',
      engineNumber: 'any_engine_power',
      engineCapacity: 'any_engine_capacity',
      fipeId: '50628',
      fipeName: 'any_fipe_name',
      model: 'any_model',
      modelYear: 2021,
      plate: 'any_plate',
      versionId: 'any_version_id',
      zipCode: 'any_zip_code',
    },
    email: 'any_email',
    name: 'any_name',
    carId: 'any_car_id',
    userId: 'any_user_id',
  };

  const queryResponseMock: Partial<QueryResponseDto> = {
    keys: {
      plate: 'any_plate',
      fipeId: '50628',
    },
    response: {
      basicVehicle: {
        brand: 'VW',
        fipeId: 51020,
        model: 'SANTANA CG',
        version: 'CS/CD/CG',
        plate: 'ABC1234',
        modelYear: 1986,
        manufactureYear: 1986,
        fuel: 'Alcool',
        chassis: '9BWZZZ32ZGP246344',
        type: 'Desconhecido',
        species: 'Desconhecido',
        isNational: true,
        enginePower: 94,
        dataCollection: null,
        nationality: null,
        axisCount: null,
        pbt: null,
        cmt: null,
        cc: null,
        currentPrice: 776700,
        seatCount: null,
        loadCapacity: null,
        gearBoxNumber: null,
        backAxisCount: null,
        auxAxisCount: null,
        engineNumber: null,
        bodyNumber: null,
        fipeData: [
          {
            brand: 'VW - VOLKSWAGEN',
            currentPrice: 379700,
            fipeId: 50628,
            version: 'CLI CL C 1.82.0 SU 2.0 2P4P',
            fuel: 'Gasolina',
            model: 'SANTANA',
            modelYear: 1986,
            priceHistory: [],
          },
          {
            brand: 'VW - VOLKSWAGEN',
            currentPrice: 520500,
            fipeId: 51020,
            version: 'CSCDCG',
            fuel: 'Desconhecido',
            model: 'SANTANA',
            modelYear: 1986,
            priceHistory: [],
          },
        ],
      },
      datasheet: [
        {
          fipeId: 50628,
          modelYear: 1986,
          records: [
            {
              description: 'Aerodinâmica',
              specs: [],
            },
            {
              description: 'Bateria',
              specs: [],
            },
            {
              description: 'Consumo',
              specs: [],
            },
            {
              description: 'Desempenho',
              specs: [],
            },
            {
              description: 'Dimensões',
              specs: [
                {
                  property: 'Distância entre-eixos',
                  value: '2548 mm',
                },
                {
                  property: 'Bitola traseira',
                  value: '1422 mm',
                },
                {
                  property: 'Altura',
                  value: '1417 mm',
                },
                {
                  property: 'Bitola dianteira',
                  value: '1414 mm',
                },
                {
                  property: 'Carga útil',
                  value: '440 kg',
                },
                {
                  property: 'Comprimento',
                  value: '4572 mm',
                },
                {
                  property: 'Largura',
                  value: '1700 mm',
                },
                {
                  property: 'Peso',
                  value: '1100 kg',
                },
                {
                  property: 'Porta-malas',
                  value: '363 litros',
                },
                {
                  property: 'Tanque de combustível',
                  value: '72 litros',
                },
              ],
            },
            {
              description: 'Direção',
              specs: [
                {
                  property: 'Assistência',
                  value: 'Hidráulica',
                },
                {
                  property: 'Diâmetro mínimo de giro',
                  value: '11,25 m',
                },
                {
                  property: 'Pneus traseiros',
                  value: '185/65 R14',
                },
                {
                  property: 'Pneus dianteiros',
                  value: '185/65 R14',
                },
              ],
            },
            {
              description: 'Freios',
              specs: [
                {
                  property: 'Traseiros',
                  value: 'Tambor',
                },
                {
                  property: 'Dianteiros',
                  value: 'Disco ventilado',
                },
              ],
            },
            {
              description: 'Geral',
              specs: [
                {
                  property: 'Procedência',
                  value: 'Nacional',
                },
                {
                  property: 'Garantia',
                  value: '1 ano',
                },
                {
                  property: 'Configuração',
                  value: 'Sedã',
                },
                {
                  property: 'Porte',
                  value: 'Médio',
                },
                {
                  property: 'Portas',
                  value: '4',
                },
                {
                  property: 'Ocupantes',
                  value: '5',
                },
              ],
            },
            {
              description: 'Iluminação',
              specs: [
                {
                  property: 'Farol Alto',
                  value: 'H4',
                },
                {
                  property: 'Farol Baixo',
                  value: 'H4',
                },
                {
                  property: 'Farol Auxiliar',
                  value: 'H3',
                },
              ],
            },
            {
              description: 'Motor',
              specs: [
                {
                  property: 'Válvulas por cilindro',
                  value: '2',
                },
                {
                  property: 'Comando de válvulas',
                  value: 'Único no cabeçote, correia dentada',
                },
                {
                  property: 'Cilindrada',
                  value: '1781 cm3',
                },
                {
                  property: 'Diâmetro dos cilindros',
                  value: '81 mm',
                },
                {
                  property: 'Disposição',
                  value: 'Longitudinal',
                },
                {
                  property: 'Combustível',
                  value: 'Álcool',
                },
                {
                  property: 'Curso dos pistões',
                  value: '86,4 mm',
                },
                {
                  property: 'Instalação',
                  value: 'Dianteiro',
                },
                {
                  property: 'Peso/potência',
                  value: '11,1 kg/cv',
                },
                {
                  property: 'Potência específica',
                  value: '55,8 cv/litro',
                },
                {
                  property: 'Torque específico',
                  value: '8,7 kgfm/litro',
                },
                {
                  property: 'Peso/torque',
                  value: '71,0 kg/kgfm',
                },
                {
                  property: 'Tuchos',
                  value: 'Hidráulicos',
                },
                {
                  property: 'Razão de compressão',
                  value: '12,3:1',
                },
                {
                  property: 'Potência máxima',
                  value: '99,3 cv  a 5600 rpm',
                },
                {
                  property: 'Torque máximo',
                  value: '15,5 kgfm  a 3600 rpm',
                },
                {
                  property: 'Aspiração',
                  value: 'Natural',
                },
                {
                  property: 'Alimentação',
                  value: 'Injeção monoponto',
                },
                {
                  property: 'Cilindros',
                  value: '4 em linha',
                },
                {
                  property: 'Código do motor',
                  value: 'AP-1800',
                },
              ],
            },
            {
              description: 'Suspensão',
              specs: [
                {
                  property: 'Traseira',
                  value: 'Eixo de torção',
                },
                {
                  property: 'Dianteira',
                  value: 'Independente, McPherson',
                },
              ],
            },
            {
              description: 'Transmissão',
              specs: [
                {
                  property: 'Câmbio',
                  value: 'Manual de 5 marchas',
                },
                {
                  property: 'Tração',
                  value: 'Dianteira',
                },
                {
                  property: 'Acoplamento',
                  value: 'Embreagem monodisco a seco',
                },
              ],
            },
          ],
        },
        {
          fipeId: 51020,
          modelYear: 1986,
          records: [
            {
              description: 'Aerodinâmica',
              specs: [
                {
                  property: 'Coeficiente de arrasto (Cx)',
                  value: '0,4',
                },
                {
                  property: 'Área frontal (A)',
                  value: '2,02 m2',
                },
                {
                  property: 'Área frontal corrigida',
                  value: '0,808 m2',
                },
              ],
            },
            {
              description: 'Bateria',
              specs: [
                {
                  property: 'Capacidade (Ah)',
                  value: '60',
                },
                {
                  property: 'Lado do polo positivo',
                  value: 'Direito',
                },
                {
                  property: 'Kg',
                  value: '14,4',
                },
              ],
            },
            {
              description: 'Consumo',
              specs: [
                {
                  property: 'Rodoviário',
                  value: '9 km/l',
                },
                {
                  property: 'Urbano',
                  value: '5,3 km/l',
                },
              ],
            },
            {
              description: 'Desempenho',
              specs: [
                {
                  property: 'Aceleração 0-100 km/h',
                  value: '13,3 s',
                },
                {
                  property: 'Velocidade máxima',
                  value: '164 km/h',
                },
              ],
            },
            {
              description: 'Dimensões',
              specs: [
                {
                  property: 'Comprimento',
                  value: '4537 mm',
                },
                {
                  property: 'Distância entre-eixos',
                  value: '2550 mm',
                },
                {
                  property: 'Carga útil',
                  value: '450 kg',
                },
                {
                  property: 'Porta-malas',
                  value: '394 litros',
                },
                {
                  property: 'Peso',
                  value: '1140 kg',
                },
                {
                  property: 'Vão livre do solo',
                  value: '130 mm',
                },
                {
                  property: 'Tanque de combustível',
                  value: '75 litros',
                },
                {
                  property: 'Bitola dianteira',
                  value: '1414 mm',
                },
                {
                  property: 'Altura',
                  value: '1402 mm',
                },
                {
                  property: 'Largura',
                  value: '1695 mm',
                },
                {
                  property: 'Bitola traseira',
                  value: '1422 mm',
                },
              ],
            },
            {
              description: 'Direção',
              specs: [
                {
                  property: 'Assistência',
                  value: 'Hidráulica',
                },
                {
                  property: 'Pneus dianteiros',
                  value: '185/70 R13',
                },
                {
                  property: 'Pneus traseiros',
                  value: '185/70 R13',
                },
                {
                  property: 'Diâmetro mínimo de giro',
                  value: '11,25 m',
                },
              ],
            },
            {
              description: 'Freios',
              specs: [
                {
                  property: 'Dianteiros',
                  value: 'Disco sólido',
                },
                {
                  property: 'Traseiros',
                  value: 'Tambor',
                },
              ],
            },
            {
              description: 'Geral',
              specs: [
                {
                  property: 'Ocupantes',
                  value: '5',
                },
                {
                  property: 'Configuração',
                  value: 'Sedã',
                },
                {
                  property: 'Procedência',
                  value: 'Nacional',
                },
                {
                  property: 'Portas',
                  value: '4',
                },
                {
                  property: 'Garantia',
                  value: '1 ano',
                },
                {
                  property: 'Porte',
                  value: 'Médio',
                },
              ],
            },
            {
              description: 'Iluminação',
              specs: [
                {
                  property: 'Farol Auxiliar',
                  value: 'H3',
                },
                {
                  property: 'Farol Alto',
                  value: 'H4',
                },
                {
                  property: 'Farol Baixo',
                  value: 'H4',
                },
              ],
            },
            {
              description: 'Motor',
              specs: [
                {
                  property: 'Razão de compressão',
                  value: '12:01',
                },
                {
                  property: 'Diâmetro dos cilindros',
                  value: '81 mm',
                },
                {
                  property: 'Válvulas por cilindro',
                  value: '2',
                },
                {
                  property: 'Tuchos',
                  value: 'Mecânicos',
                },
                {
                  property: 'Alimentação',
                  value: 'Carburador',
                },
                {
                  property: 'Disposição',
                  value: 'Longitudinal',
                },
                {
                  property: 'Comando de válvulas',
                  value: 'Único no cabeçote, correia dentada',
                },
                {
                  property: 'Cilindros',
                  value: '4 em linha',
                },
                {
                  property: 'Instalação',
                  value: 'Dianteiro',
                },
                {
                  property: 'Cilindrada',
                  value: '1781 cm3',
                },
                {
                  property: 'Combustível',
                  value: 'Álcool',
                },
                {
                  property: 'Peso/potência',
                  value: '12,13 kg/cv',
                },
                {
                  property: 'Código do motor',
                  value: 'AP-1800',
                },
                {
                  property: 'Potência específica',
                  value: '52,78 cv/litro',
                },
                {
                  property: 'Peso/torque',
                  value: '75,00 kg/kgfm',
                },
                {
                  property: 'Torque específico',
                  value: '8,53 kgfm/litro',
                },
                {
                  property: 'Potência máxima',
                  value: '94 cv  a 5000 rpm',
                },
                {
                  property: 'Torque máximo',
                  value: '15,2 kgfm  a 3400 rpm',
                },
                {
                  property: 'Curso dos pistões',
                  value: '86,4 mm',
                },
                {
                  property: 'Aspiração',
                  value: 'Natural',
                },
              ],
            },
            {
              description: 'Suspensão',
              specs: [
                {
                  property: 'Dianteira',
                  value: 'Independente, McPherson',
                },
                {
                  property: 'Traseira',
                  value: 'Eixo de torção',
                },
              ],
            },
            {
              description: 'Transmissão',
              specs: [
                {
                  property: 'Tração',
                  value: 'Dianteira',
                },
                {
                  property: 'Acoplamento',
                  value: 'Conversor de torque',
                },
                {
                  property: 'Câmbio',
                  value: 'Automático de 3 marchas',
                },
              ],
            },
          ],
        },
      ],
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: QueryDatasheetDomain,
          useClass: QueryDatasheetUseCase,
        },
        {
          provide: MyCarProductRepository,
          useValue: {
            getByUserIdAndCarId: jest.fn(),
          },
        },
        {
          provide: QueryRequestService,
          useValue: {
            requestQuery: jest.fn(),
            getAsyncQueryByReference: jest.fn(),
          },
        },
      ],
    }).compile();

    myCarProductRepository = module.get(MyCarProductRepository);
    queryRequestService = module.get(QueryRequestService);
  });

  beforeEach(async () => {
    sut = await module.resolve(QueryDatasheetDomain);
  });

  describe('#execute', () => {
    test('should call execute and return CarNotFoundError error', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce(null);

      const promise: Promise<MyCarQueryDatasheet> = sut.execute(userId, carId).unsafeRun();

      await expect(promise).rejects.toThrow(CarNotFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status DEACTIVE and throw not found', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ status: MyCarProductStatusEnum.DEACTIVE } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryDatasheet> = sut.execute(userId, carId).unsafeRun();

      await expect(promise).rejects.toThrow(CarNotFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status EXCLUDED and throw not found', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce({ status: MyCarProductStatusEnum.EXCLUDED } as MyCarProductWithUserDto);

      const promise: Promise<MyCarQueryDatasheet> = sut.execute(userId, carId).unsafeRun();

      await expect(promise).rejects.toThrow(CarNotFoundError);
      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(0);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(0);
    });

    test('should get my car with status EXCLUDING and throw not found', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce({
        ...carProductMock,
        status: MyCarProductStatusEnum.EXCLUDING,
      } as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      await sut
        .execute(userId, carId)
        .tap((myCarDatasheet: MyCarQueryDatasheet) => {
          expect(myCarDatasheet).not.toEqual(null);
        })
        .safeRun();

      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(1);
      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(1);
    });

    test('should call getByUserIdAndCarId one time with userId and CardId', async () => {
      jest.spyOn(myCarProductRepository, 'getByUserIdAndCarId').mockResolvedValueOnce(null);

      await sut.execute(userId, carId).safeRun();

      expect(myCarProductRepository.getByUserIdAndCarId).toHaveBeenCalledTimes(1);
      expect(myCarProductRepository.getByUserIdAndCarId).toHaveBeenCalledWith(userId, carId);
    });

    test('should call one requestQuery time', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      await sut.execute(userId, carId).safeRun();

      expect(queryRequestService.requestQuery).toHaveBeenCalledTimes(1);
    });

    test('should call getAsyncQueryByReference one time with queryRef', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      await sut.execute(userId, carId).safeRun();

      expect(queryRequestService.getAsyncQueryByReference).toHaveBeenCalledTimes(1);
    });

    test('should not return null response', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      await sut
        .execute(userId, carId)
        .tap((myCarDatasheet: MyCarQueryDatasheet) => {
          expect(myCarDatasheet).not.toEqual(null);
        })
        .safeRun();
    });

    test('should not return null response', async () => {
      jest
        .spyOn(myCarProductRepository, 'getByUserIdAndCarId')
        .mockResolvedValueOnce(carProductMock as MyCarProductWithUserDto);
      jest
        .spyOn(queryRequestService, 'getAsyncQueryByReference')
        .mockResolvedValueOnce(queryResponseMock as QueryResponseDto);

      await sut
        .execute(userId, carId)
        .map((myCarDatasheet: MyCarQueryDatasheet) => {
          expect(myCarDatasheet).toStrictEqual({
            fipeCode: '50628',
            version: 'CLI CL C 1.82.0 SU 2.0 2P4P',
            currentValue: '379700',
            guarantee: '1 ano',
            maxVelocity: null,
            urbanConsumption: null,
            roadConsumption: null,
            transmission: [
              { property: 'Câmbio', value: 'Manual de 5 marchas' },
              { property: 'Tração', value: 'Dianteira' },
              { property: 'Acoplamento', value: 'Embreagem monodisco a seco' },
            ],
            consumption: [],
            performance: [],
            brake: [
              { property: 'Traseiros', value: 'Tambor' },
              { property: 'Dianteiros', value: 'Disco ventilado' },
            ],
            suspension: [
              { property: 'Traseira', value: 'Eixo de torção' },
              { property: 'Dianteira', value: 'Independente, McPherson' },
            ],
            steeringWheel: [
              { property: 'Assistência', value: 'Hidráulica' },
              { property: 'Diâmetro mínimo de giro', value: '11,25 m' },
              { property: 'Pneus traseiros', value: '185/65 R14' },
              { property: 'Pneus dianteiros', value: '185/65 R14' },
            ],
            aerodynamics: [],
            battery: [],
            dimensions: [
              { property: 'Distância entre-eixos', value: '2548 mm' },
              { property: 'Bitola traseira', value: '1422 mm' },
              { property: 'Altura', value: '1417 mm' },
              { property: 'Bitola dianteira', value: '1414 mm' },
              { property: 'Carga útil', value: '440 kg' },
              { property: 'Comprimento', value: '4572 mm' },
              { property: 'Largura', value: '1700 mm' },
              { property: 'Peso', value: '1100 kg' },
              { property: 'Porta-malas', value: '363 litros' },
              { property: 'Tanque de combustível', value: '72 litros' },
            ],
            lighting: [
              { property: 'Farol Alto', value: 'H4' },
              { property: 'Farol Baixo', value: 'H4' },
              { property: 'Farol Auxiliar', value: 'H3' },
            ],
            lubricant: [],
            motor: [
              { property: 'Válvulas por cilindro', value: '2' },
              {
                property: 'Comando de válvulas',
                value: 'Único no cabeçote, correia dentada',
              },
              { property: 'Cilindrada', value: '1781 cm3' },
              { property: 'Diâmetro dos cilindros', value: '81 mm' },
              { property: 'Disposição', value: 'Longitudinal' },
              { property: 'Combustível', value: 'Álcool' },
              { property: 'Curso dos pistões', value: '86,4 mm' },
              { property: 'Instalação', value: 'Dianteiro' },
              { property: 'Peso/potência', value: '11,1 kg/cv' },
              { property: 'Potência específica', value: '55,8 cv/litro' },
              { property: 'Torque específico', value: '8,7 kgfm/litro' },
              { property: 'Peso/torque', value: '71,0 kg/kgfm' },
              { property: 'Tuchos', value: 'Hidráulicos' },
              { property: 'Razão de compressão', value: '12,3:1' },
              { property: 'Potência máxima', value: '99,3 cv  a 5600 rpm' },
              { property: 'Torque máximo', value: '15,5 kgfm  a 3600 rpm' },
              { property: 'Aspiração', value: 'Natural' },
              { property: 'Alimentação', value: 'Injeção monoponto' },
              { property: 'Cilindros', value: '4 em linha' },
              { property: 'Código do motor', value: 'AP-1800' },
            ],
          });
        })
        .unsafeRun();
    });
  });
});
