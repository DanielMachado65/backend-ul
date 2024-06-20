import { BasicVehicleVo } from 'src/domain/value-object/basic-vechicle.vo';
import { QueryBasicVehicleDataVo } from 'src/domain/value-object/query/query-basic-vehicle.vo';
import { BasicVehicleParser } from 'src/infrastructure/service/query/parser/basic-vehicle-parser';
import { mockBasicVehicleVo } from 'src/infrastructure/service/query/test/parser/mocks/special-datasheet.mock';

describe(BasicVehicleParser.name, () => {
  test('should return null if input is null or undefined', () => {
    const result: QueryBasicVehicleDataVo = BasicVehicleParser.parse(null);
    expect(result).toBe(null);

    const result2: QueryBasicVehicleDataVo = BasicVehicleParser.parse(undefined);
    expect(result2).toBe(null);
  });

  test('should parse input to QueryBasicVehicleDataVo', () => {
    const basicVehicle: BasicVehicleVo = mockBasicVehicleVo();

    const result: QueryBasicVehicleDataVo = BasicVehicleParser.parse(basicVehicle);

    expect(result).toStrictEqual({
      anoFabricacao: basicVehicle.manufactureYear,
      anoModelo: basicVehicle.modelYear,
      caixaCambio: basicVehicle.gearBoxNumber,
      capacidadeCarga: basicVehicle.loadCapacity,
      capacidadePassageiro: basicVehicle.seatCount,
      capMaxTracao: basicVehicle.cmt.toString(),
      chassi: basicVehicle.chassis,
      cilindradas: basicVehicle.cc,
      codigoFipe: basicVehicle.fipeId,
      combustivel: basicVehicle.fuel,
      descricao: basicVehicle.model,
      eixos: basicVehicle.axisCount,
      especieVeiculo: basicVehicle.species,
      marca: basicVehicle.model,
      nacional: basicVehicle.nationality,
      numCarroceria: basicVehicle.bodyNumber,
      numeroEixosAuxiliar: basicVehicle.auxAxisCount,
      numeroEixosTraseiro: basicVehicle.backAxisCount,
      numMotor: basicVehicle.engineNumber,
      pbt: basicVehicle.pbt.toString(),
      placa: basicVehicle.plate,
      potencia: basicVehicle.enginePower,
      tipoVeiculo: basicVehicle.type,
      informacoesFipe: [
        {
          ano: basicVehicle.fipeData[0].modelYear,
          combustivel: basicVehicle.fipeData[0].fuel,
          fipeId: basicVehicle.fipeData[0].fipeId.toString(),
          historicoPreco: [
            {
              ano: basicVehicle.fipeData[0].priceHistory[0].year,
              mes: basicVehicle.fipeData[0].priceHistory[0].month,
              valor: (basicVehicle.fipeData[0].priceHistory[0].price / 100).toFixed(2),
              predicao: false,
            },
          ],
          marca: basicVehicle.fipeData[0].brand,
          modelo: basicVehicle.fipeData[0].model,
          valorAtual: (basicVehicle.fipeData[0].currentPrice / 100).toFixed(2),
          versao: basicVehicle.fipeData[0].version,
        },
      ],
      informacoesGerais: [
        {
          fipeId: basicVehicle.fipeData[0].fipeId?.toString(),
          versao: basicVehicle.fipeData[0].version,
          modelo: basicVehicle.model,
          marca: basicVehicle.brand,
        },
      ],
    });
  });

  test('should parse input to QueryBasicVehicleDataVo with all fields null', () => {
    const basicVehicle: BasicVehicleVo = {
      dataCollection: [
        {
          fipeId: null,
          versionId: null,
        },
      ],

      fipeData: [
        {
          brand: null,
          currentPrice: null,
          fipeId: null,
          fuel: null,
          model: null,
          version: null,
          modelYear: null,
          priceHistory: [{ month: null, price: null, year: null }],
        },
      ],
      brand: null,
      fipeId: null,
      model: null,
      version: null,
      plate: null,
      modelYear: null,
      manufactureYear: null,
      fuel: null,
      chassis: null,
      type: null,
      species: null,
      isNational: null,
      enginePower: null,
      nationality: null,
      axisCount: null,
      pbt: null,
      cmt: null,
      cc: null,
      currentPrice: null,
      seatCount: null,
      loadCapacity: null,
      gearBoxNumber: null,
      backAxisCount: null,
      auxAxisCount: null,
      engineNumber: null,
      bodyNumber: null,
    };

    const result: QueryBasicVehicleDataVo = BasicVehicleParser.parse(basicVehicle);

    expect(result).toStrictEqual({
      anoFabricacao: null,
      anoModelo: null,
      caixaCambio: null,
      capacidadeCarga: null,
      capacidadePassageiro: null,
      capMaxTracao: null,
      chassi: null,
      cilindradas: null,
      codigoFipe: null,
      combustivel: null,
      descricao: null,
      eixos: null,
      especieVeiculo: null,
      marca: null,
      nacional: null,
      numCarroceria: null,
      numeroEixosAuxiliar: null,
      numeroEixosTraseiro: null,
      numMotor: null,
      pbt: null,
      placa: null,
      potencia: null,
      tipoVeiculo: null,
      informacoesFipe: [
        {
          ano: null,
          combustivel: null,
          fipeId: null,
          historicoPreco: [
            {
              ano: null,
              mes: null,
              valor: '0.00',
              predicao: false,
            },
          ],
          marca: null,
          modelo: null,
          valorAtual: null,
          versao: null,
        },
      ],
      informacoesGerais: [
        {
          fipeId: null,
          versao: null,
          modelo: null,
          marca: null,
        },
      ],
    });
  });
  test('should parse input to QueryBasicVehicleDataVo with all fields null 2', () => {
    const basicVehicle: BasicVehicleVo = {
      dataCollection: null,

      fipeData: null,
      brand: null,
      fipeId: null,
      model: null,
      version: null,
      plate: null,
      modelYear: null,
      manufactureYear: null,
      fuel: null,
      chassis: null,
      type: null,
      species: null,
      isNational: null,
      enginePower: null,
      nationality: null,
      axisCount: null,
      pbt: null,
      cmt: null,
      cc: null,
      currentPrice: null,
      seatCount: null,
      loadCapacity: null,
      gearBoxNumber: null,
      backAxisCount: null,
      auxAxisCount: null,
      engineNumber: null,
      bodyNumber: null,
    };

    const result: QueryBasicVehicleDataVo = BasicVehicleParser.parse(basicVehicle);

    expect(result).toStrictEqual({
      anoFabricacao: null,
      anoModelo: null,
      caixaCambio: null,
      capacidadeCarga: null,
      capacidadePassageiro: null,
      capMaxTracao: null,
      chassi: null,
      cilindradas: null,
      codigoFipe: null,
      combustivel: null,
      descricao: null,
      eixos: null,
      especieVeiculo: null,
      marca: null,
      nacional: null,
      numCarroceria: null,
      numeroEixosAuxiliar: null,
      numeroEixosTraseiro: null,
      numMotor: null,
      pbt: null,
      placa: null,
      potencia: null,
      tipoVeiculo: null,
      informacoesFipe: [],
      informacoesGerais: [],
    });
  });

  test('should parse input to QueryBasicVehicleDataVo with price history null', () => {
    const basicVehicle: BasicVehicleVo = {
      ...mockBasicVehicleVo(),
      fipeData: [{ ...mockBasicVehicleVo().fipeData[0], priceHistory: null }],
    };

    const result: QueryBasicVehicleDataVo = BasicVehicleParser.parse(basicVehicle);

    expect(result).toStrictEqual({
      anoFabricacao: basicVehicle.manufactureYear,
      anoModelo: basicVehicle.modelYear,
      caixaCambio: basicVehicle.gearBoxNumber,
      capacidadeCarga: basicVehicle.loadCapacity,
      capacidadePassageiro: basicVehicle.seatCount,
      capMaxTracao: basicVehicle.cmt.toString(),
      chassi: basicVehicle.chassis,
      cilindradas: basicVehicle.cc,
      codigoFipe: basicVehicle.fipeId,
      combustivel: basicVehicle.fuel,
      descricao: basicVehicle.model,
      eixos: basicVehicle.axisCount,
      especieVeiculo: basicVehicle.species,
      marca: basicVehicle.model,
      nacional: basicVehicle.nationality,
      numCarroceria: basicVehicle.bodyNumber,
      numeroEixosAuxiliar: basicVehicle.auxAxisCount,
      numeroEixosTraseiro: basicVehicle.backAxisCount,
      numMotor: basicVehicle.engineNumber,
      pbt: basicVehicle.pbt.toString(),
      placa: basicVehicle.plate,
      potencia: basicVehicle.enginePower,
      tipoVeiculo: basicVehicle.type,
      informacoesFipe: [
        {
          ano: basicVehicle.fipeData[0].modelYear,
          combustivel: basicVehicle.fipeData[0].fuel,
          fipeId: basicVehicle.fipeData[0].fipeId.toString(),
          historicoPreco: [],
          marca: basicVehicle.fipeData[0].brand,
          modelo: basicVehicle.fipeData[0].model,
          valorAtual: (basicVehicle.fipeData[0].currentPrice / 100).toFixed(2),
          versao: basicVehicle.fipeData[0].version,
        },
      ],
      informacoesGerais: [
        {
          fipeId: basicVehicle.fipeData[0].fipeId?.toString(),
          versao: basicVehicle.fipeData[0].version,
          modelo: basicVehicle.model,
          marca: basicVehicle.brand,
        },
      ],
    });
  });
});
