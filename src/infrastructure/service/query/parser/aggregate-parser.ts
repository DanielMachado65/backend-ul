import { AggregateVo } from 'src/domain/value-object/aggregate.vo';
import { NationalBaseVo } from 'src/domain/value-object/national-base.vo';
import { QueryAggregateVo } from 'src/domain/value-object/query/query-aggregate.vo';
import { StateBaseVo } from 'src/domain/value-object/state-base.vo';

export class AggregateParser {
  private static _parseValue(aggregateValue: string, nationalBaseValue?: string, stateBaseValue?: string): string {
    if (typeof aggregateValue === 'string' && aggregateValue !== 'DESCONHECIDO') {
      return aggregateValue;
    }

    return nationalBaseValue || stateBaseValue || null;
  }

  static parse(
    aggregate: AggregateVo,
    nationalBase?: NationalBaseVo,
    stateBase?: StateBaseVo,
  ): Partial<QueryAggregateVo> {
    if (aggregate === null || aggregate === undefined) return null;
    return {
      anoFabricacao: AggregateParser._parseValue(
        aggregate?.manufactureYear?.toString(),
        nationalBase?.manufactureYear?.toString(),
        stateBase?.manufactureYear?.toString(),
      ),
      anoModelo: AggregateParser._parseValue(
        aggregate?.modelYear?.toString(),
        nationalBase?.modelYear?.toString(),
        stateBase?.modelYear?.toString(),
      ),
      caixaCambio: aggregate?.exchangeBox,
      capacidadeCarga: aggregate?.loadCapacity,
      capacidadePassageiro: aggregate?.passengerCapacity?.toString(),
      capMaxTracao: AggregateParser._parseValue(aggregate?.maxTractionCapacity, nationalBase?.cmt, stateBase?.cmt),
      categoria: null, // TODO
      chassi: AggregateParser._parseValue(aggregate?.chassis, nationalBase?.chassis, stateBase?.chassis),
      cidade: AggregateParser._parseValue(aggregate?.city, nationalBase?.city, stateBase?.city),
      cilindradas: aggregate?.engineCapacity,
      cmt: AggregateParser._parseValue(aggregate?.maxTractionCapacity, nationalBase?.cmt, stateBase?.cmt),
      codigoCombustivel: aggregate?.fuelCode?.toString(),
      codigoMarca: aggregate?.brandCode?.toString(),
      codigoMarcaModelo: aggregate?.modelBrandCode?.toString(),
      codigoMunicipio: aggregate?.cityCode?.toString(),
      combustivel: AggregateParser._parseValue(aggregate?.fuel, nationalBase?.fuel, stateBase?.fuel),
      corVeiculo: aggregate?.vehicleColor,
      dataEmplacamento: aggregate?.licencePlateDate?.toLocaleString(),
      docFaturado: AggregateParser._parseValue(aggregate?.billingDocument, nationalBase?.docBilled),
      docProprietario: aggregate?.ownerDoc,
      documentoImportadora: aggregate?.importDoc,
      dtAtualizacao: aggregate?.updateDate?.toLocaleString(),
      dtUltimaAtualizacao: aggregate?.lastUpdateDate?.toLocaleString(),
      eixos: AggregateParser._parseValue(aggregate?.axesQuantity?.toString(), nationalBase?.axis, stateBase?.axis),
      eixoTraseiroDif: aggregate?.rearAxleDif,
      especieVeiculo: aggregate?.vehicleSpecies,
      familia: aggregate?.family,
      identImportadora: null, // TODO - ver se é usado
      inspecaoGnv: null, // TODO - ver se é usado
      limiteRestricaoTrib: null, // TODO - ver se é usado
      marca: AggregateParser._parseValue(aggregate?.brand, nationalBase?.brand),
      marcaModelo: AggregateParser._parseValue(aggregate?.modelBrand, nationalBase?.brandModel, stateBase?.brandModel),
      modelo: AggregateParser._parseValue(aggregate?.model, nationalBase?.model, stateBase?.model),
      municipio: AggregateParser._parseValue(aggregate?.city, nationalBase?.city, stateBase?.city),
      municipioEmplacamento: null, // TODO - ver se é usado
      nacionalidade: aggregate?.nationality,
      numCarroceria: aggregate?.carBodyNumber,
      numFaturado: aggregate?.billingDocument,
      numMotor: AggregateParser._parseValue(
        aggregate?.engineNumber,
        nationalBase?.engineNumber,
        stateBase?.engineNumber,
      ),
      numTerceiroEixo: aggregate?.thirdAxisNumber?.toString(),
      pbt: aggregate?.totalGrossWeight?.toString(),
      pesoBrutoTotal: aggregate?.totalGrossWeight?.toString(),
      placa: AggregateParser._parseValue(aggregate?.plate, nationalBase?.plate, stateBase?.plate),
      potencia: aggregate?.potency,
      procedencia: aggregate?.origin,
      qtdPax: null, // TODO - ver se é usado
      registroDi: null, //TODO - ver se é usado
      renavam: AggregateParser._parseValue(aggregate?.renavam, nationalBase?.renavam, stateBase?.renavam),
      situacaoChassi: aggregate?.chassisSituation,
      situacaoVeiculo: aggregate?.vehicleSituation,
      tipoCarroceria: aggregate?.carBodyType,
      tipoDocFaturado: AggregateParser._parseValue(aggregate?.billingDocumentType, nationalBase?.billedDocType),
      tipoDocImportadora: aggregate?.importDocType,
      tipoMontagem: aggregate?.assemblyType,
      tipoVeiculo: AggregateParser._parseValue(
        aggregate?.vehicleType,
        nationalBase?.vehicleType,
        stateBase?.vehicleType,
      ),
      uf: AggregateParser._parseValue(aggregate?.uf, nationalBase?.uf, stateBase?.uf),
      ufFaturado: aggregate?.ufBilled,
      ultimaDataInclusao: aggregate?.lastInclusionDate?.toLocaleString(),
      valorAnunciado: null, // TODO - ver se é usado
    };
  }
}
