import { AccessoryRecord, AccessoryVo } from 'src/domain/value-object/accessory.vo';
import { BasicVehicleDataCollection } from 'src/domain/value-object/basic-vechicle.vo';
import {
  QueryAccessoryFipeVehicleData,
  QueryAccessoryFipeVehicleRecord,
  QueryAccessoryVo,
} from 'src/domain/value-object/query/query-accessory.vo';

export class AccessoriesParser {
  static parse(
    accessories: ReadonlyArray<AccessoryVo>,
    dataCollection: ReadonlyArray<BasicVehicleDataCollection>,
  ): QueryAccessoryVo {
    if (!Array.isArray(accessories) || !Array.isArray(dataCollection)) {
      return { veiculosFipe: [] };
    }

    const queryFipeVehicleAccessories: ReadonlyArray<QueryAccessoryFipeVehicleData> = accessories?.map(
      (accessory: AccessoryVo) => {
        const fipeCollection: BasicVehicleDataCollection = dataCollection.find(
          (collection: BasicVehicleDataCollection) => collection.fipeId === accessory.fipeId?.toString(),
        );

        return {
          fipeId: accessory.fipeId?.toString(),
          idVersao: fipeCollection?.versionId?.toString() ?? null,
          registros: AccessoriesParser._parseAccessoryRecord(accessory.records),
        };
      },
    );

    return {
      veiculosFipe: queryFipeVehicleAccessories,
    };
  }

  private static _parseAccessoryRecord(
    records: ReadonlyArray<AccessoryRecord>,
  ): ReadonlyArray<QueryAccessoryFipeVehicleRecord> {
    return (
      records &&
      records.map((record: AccessoryRecord) => ({
        descricao: record.description,
        itemDeSerie: record.isSeries,
      }))
    );
  }
}
