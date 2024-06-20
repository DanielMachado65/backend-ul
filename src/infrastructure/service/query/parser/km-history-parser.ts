import { KmBaseVo, KmHistory } from 'src/domain/value-object/km-history.vo';
import { QueryKmHistory } from 'src/domain/value-object/query/query-base-km.vo';

export class KmBaseParser {
  static parse(kmBase: KmBaseVo): ReadonlyArray<QueryKmHistory> {
    if (kmBase === null || kmBase === undefined || !Array.isArray(kmBase.kmHistory)) return [];
    return kmBase.kmHistory?.map((history: KmHistory) => ({
      dataInclusao: history?.includedDate ?? null,
      km: history?.km,
    }));
  }
}
