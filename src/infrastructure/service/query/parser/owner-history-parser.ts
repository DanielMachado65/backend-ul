import { OwnerHistoryVo } from 'src/domain/value-object/owner-history.vo';
import { QueryVehicleOwnersVo } from 'src/domain/value-object/query/query-vehicle-owners.vo';

export class OwnerHistoryParser {
  static parse(ownerHistory: OwnerHistoryVo): QueryVehicleOwnersVo {
    if (ownerHistory === null || ownerHistory === undefined) return null;
    return {
      primeiroRegistro: ownerHistory?.firstRecord,
      ultimoRegistro: ownerHistory?.lastRecord,
      quantidadePf: ownerHistory?.totalPF,
      quantidadePJ: ownerHistory?.totalPJ,
      total: ownerHistory?.total,
      ufs: ownerHistory?.ufs,
    };
  }
}
