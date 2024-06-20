import {
  BasicVehicleFipePriceHistory,
  BasicVehicleFipeVo,
  BasicVehicleVo,
} from 'src/domain/value-object/basic-vechicle.vo';
import {
  QueryBasicVehicleDataVo,
  QueryBasicVehicleFipeHistory,
  QueryBasicVehicleFipeInfoData,
  QueryBasicVehicleGeneralInfo,
} from 'src/domain/value-object/query/query-basic-vehicle.vo';

export class BasicVehicleParser {
  static parse(basicVehicle: BasicVehicleVo): QueryBasicVehicleDataVo {
    if (basicVehicle === null || basicVehicle === undefined) return null;
    return {
      anoFabricacao: basicVehicle?.manufactureYear,
      anoModelo: basicVehicle?.modelYear,
      caixaCambio: basicVehicle?.gearBoxNumber,
      capacidadeCarga: basicVehicle?.loadCapacity,
      capacidadePassageiro: basicVehicle?.seatCount,
      capMaxTracao: basicVehicle?.cmt?.toString() ?? null,
      chassi: basicVehicle?.chassis,
      cilindradas: basicVehicle?.cc,
      codigoFipe: basicVehicle?.fipeId,
      combustivel: basicVehicle?.fuel,
      descricao: basicVehicle?.model,
      eixos: basicVehicle?.axisCount,
      especieVeiculo: basicVehicle?.species,
      informacoesFipe: BasicVehicleParser._parseVehicleBasicDataFipeInfo(basicVehicle?.fipeData),
      informacoesGerais: BasicVehicleParser._parseVehicleBasicDataGeneralInfo(basicVehicle),
      marca: basicVehicle?.model,
      nacional: basicVehicle?.nationality, // TODO - rever esse nome
      numCarroceria: basicVehicle?.bodyNumber,
      numeroEixosAuxiliar: basicVehicle?.auxAxisCount,
      numeroEixosTraseiro: basicVehicle?.backAxisCount,
      numMotor: basicVehicle?.engineNumber,
      pbt: basicVehicle?.pbt?.toString() ?? null,
      placa: basicVehicle?.plate,
      potencia: basicVehicle?.enginePower,
      tipoVeiculo: basicVehicle?.type,
    };
  }

  private static _parseVehicleBasicDataFipeInfo(
    fipeData: ReadonlyArray<BasicVehicleFipeVo>,
  ): ReadonlyArray<QueryBasicVehicleFipeInfoData> {
    if (!Array.isArray(fipeData)) return [];

    return fipeData?.map((fipe: BasicVehicleFipeVo) => ({
      ano: fipe.modelYear,
      combustivel: fipe.fuel,
      fipeId: fipe.fipeId?.toString() ?? null,
      historicoPreco: BasicVehicleParser._parseVehicleBasicDataFipeHistory(fipe?.priceHistory),
      marca: fipe.brand,
      modelo: fipe.model,
      valorAtual: fipe.currentPrice ? (fipe.currentPrice / 100).toFixed(2) : null,
      versao: fipe.version,
    }));
  }

  private static _parseVehicleBasicDataFipeHistory(
    priceHistory: ReadonlyArray<BasicVehicleFipePriceHistory>,
  ): ReadonlyArray<QueryBasicVehicleFipeHistory> {
    if (!Array.isArray(priceHistory)) return [];
    return priceHistory?.map((history: BasicVehicleFipePriceHistory) => ({
      ano: history.year,
      mes: history.month,
      valor: (history.price / 100).toFixed(2),
      predicao: false,
    }));
  }

  private static _parseVehicleBasicDataGeneralInfo(
    basicVehicle: BasicVehicleVo,
  ): ReadonlyArray<QueryBasicVehicleGeneralInfo> {
    if (basicVehicle === null || basicVehicle === undefined || !Array.isArray(basicVehicle?.fipeData)) return [];

    const fipeData: ReadonlyArray<BasicVehicleFipeVo> = basicVehicle?.fipeData;
    return fipeData?.map((reg: BasicVehicleFipeVo) => ({
      fipeId: reg.fipeId?.toString() ?? null,
      versao: reg.version,
      modelo: basicVehicle.model,
      marca: basicVehicle.brand,
    }));
  }
}
