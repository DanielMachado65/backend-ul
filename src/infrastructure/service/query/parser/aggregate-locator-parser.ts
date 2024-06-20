import { AggregateLocatorVo } from 'src/domain/value-object/aggregate-locator.vo';
import { QueryAggregateLocatorVo } from 'src/domain/value-object/query/query-aggregate-locator.vo';

export class AggregateLocatorParser {
  static parse(aggregateLocator: ReadonlyArray<AggregateLocatorVo>): ReadonlyArray<QueryAggregateLocatorVo> {
    if (!Array.isArray(aggregateLocator)) return [];
    return aggregateLocator.map((aggregate: AggregateLocatorVo) => ({
      anoFabricacao: aggregate.manufactureYear?.toString(),
      anoModelo: aggregate.modelYear?.toString(),
      imagemUrl: aggregate.imagemUrl,
      marca: aggregate.brand,
      modelo: aggregate.model,
      observacao: aggregate.details,
      parte: aggregate.part,
      tipoVeiculo: aggregate.vehicleType,
    }));
  }
}
