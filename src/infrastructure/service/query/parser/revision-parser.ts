import {
  QueryRevisionFipeVehicleData,
  QueryRevisionFipeVehicleRecord,
  QueryRevisionVo,
} from 'src/domain/value-object/query/query-revision.vo';
import { RevisionChangedPartData, RevisionRecord, RevisionVo } from 'src/domain/value-object/revision.vo';

export class RevisionParser {
  static parse(revisions: ReadonlyArray<RevisionVo>): QueryRevisionVo {
    if (!Array.isArray(revisions)) return { veiculosFipe: [] };

    const queryFipeVehicleRevision: ReadonlyArray<QueryRevisionFipeVehicleData> = revisions
      .filter((revision: RevisionVo) => !!revision.fipeId)
      .map((revision: RevisionVo) => ({
        fipeId: revision.fipeId?.toString(),
        idVersao: revision.versionId?.toString(),
        registros: RevisionParser._parseRevisionRecords(revision.records),
      }));

    return {
      veiculosFipe: queryFipeVehicleRevision,
    };
  }

  private static _parseRevisionRecords(
    records: ReadonlyArray<RevisionRecord>,
  ): ReadonlyArray<QueryRevisionFipeVehicleRecord> {
    return records.map((record: RevisionRecord) => ({
      kilometragem: record?.kilometers,
      meses: record?.months,
      parcelas: record?.parcels,
      duracaoEmMinutos: record?.durationMinutes,
      precoTotal: record?.fullPrice,
      precoParcela: record?.parcelPrice,
      pecasTrocadas: record?.changedParts?.map((parts: RevisionChangedPartData) => ({
        descricao: parts?.description,
        quantidade: parts?.amount,
      })),
      inspecoes: record?.inspections,
    }));
  }
}
