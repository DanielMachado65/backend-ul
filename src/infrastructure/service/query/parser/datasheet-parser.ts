import { DatasheetRecord, DatasheetRecordSpec, DatasheetVo } from 'src/domain/value-object/datasheet.vo';
import {
  QueryDatasheetFipeVehicle,
  QueryDatasheetRecord,
  QueryDatasheetRecordSpec,
  QueryDatasheetVo,
} from 'src/domain/value-object/query/query-datasheet.vo';

export class DataSheetParser {
  static parse(datasheets: ReadonlyArray<DatasheetVo>): QueryDatasheetVo {
    if (!Array.isArray(datasheets)) return { registros: [], veiculosFipe: [] };

    const fipeVehicles: ReadonlyArray<QueryDatasheetFipeVehicle> = datasheets
      .filter((datasheet: DatasheetVo) => !!datasheet.fipeId)
      .map((datasheet: DatasheetVo) => ({
        fipeId: datasheet.fipeId,
        registros: DataSheetParser._parseDatasheetRecords(datasheet.records),
      }));

    const allRecords: ReadonlyArray<QueryDatasheetRecord> = fipeVehicles.flatMap(
      (datasheet: QueryDatasheetFipeVehicle) => datasheet.registros,
    );

    return {
      veiculosFipe: fipeVehicles,
      registros: allRecords,
    };
  }

  private static _parseDatasheetRecords(records: ReadonlyArray<DatasheetRecord>): ReadonlyArray<QueryDatasheetRecord> {
    return (
      records &&
      records.map((record: DatasheetRecord) => ({
        descricao: record.description,
        especificacoes: DataSheetParser._parseDatasheetRecordSpecs(record.specs),
      }))
    );
  }

  private static _parseDatasheetRecordSpecs(
    specs: ReadonlyArray<DatasheetRecordSpec>,
  ): ReadonlyArray<QueryDatasheetRecordSpec> {
    return (
      specs &&
      specs?.map((spec: DatasheetRecordSpec) => ({
        propriedade: spec.property,
        valor: spec.value,
      }))
    );
  }
}
