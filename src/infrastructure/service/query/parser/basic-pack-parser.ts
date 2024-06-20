import { BasicPackRecord, BasicPackVo } from 'src/domain/value-object/basic-pack.vo';
import {
  QueryBasicPackFipeVehicle,
  QueryBasicPackRecord,
  QueryBasicPackVo,
} from 'src/domain/value-object/query/query-basic-pack.vo';

export class BasicPackParser {
  static parse(basickPacks: ReadonlyArray<BasicPackVo>): QueryBasicPackVo {
    if (!Array.isArray(basickPacks)) return { registros: [], veiculosFipe: [] };

    const fipeVeicles: ReadonlyArray<QueryBasicPackFipeVehicle> = basickPacks?.map((basicPack: BasicPackVo) => ({
      fipeId: basicPack.fipeId,
      registros: BasicPackParser._parseBasicPackRecord(basicPack.records),
    }));

    const allRecords: ReadonlyArray<QueryBasicPackRecord> = fipeVeicles.flatMap(
      (record: QueryBasicPackFipeVehicle) => record.registros,
    );

    return {
      veiculosFipe: fipeVeicles,
      registros: allRecords,
    };
  }

  private static _parseBasicPackRecord(records: ReadonlyArray<BasicPackRecord>): ReadonlyArray<QueryBasicPackRecord> {
    return (
      records &&
      records.map((record: BasicPackRecord) => ({
        IdApelido: record?.nicknameId,
        apelidoDescricao: record?.nicknameDescription,
        aposDescricaoFabricante: record?.aftermarketMakerDescription,
        complemento: record?.complement,
        genuina: record?.isGenuine,
        numeroPeca: record?.partNumber,
        valor: record?.value,
      }))
    );
  }
}
