import { QueryRenajudVo } from 'src/domain/value-object/query/query-renajud.vo';
import { RenajudVo } from 'src/domain/value-object/renajud.vo';

export class RenajudParser {
  static parse(renajuds: ReadonlyArray<RenajudVo>): ReadonlyArray<QueryRenajudVo> {
    if (!Array.isArray(renajuds)) return null;
    return renajuds.map((renajud: RenajudVo) => ({
      codigoOrgaoJudicial: null,
      codigoTribunal: renajud.codeCourt,
      processo: renajud.process,
      constaRenajud: renajud.consistsRenajud,
      dataInclusao: renajud.inclusionDate?.toLocaleString() ?? null,
      detalheRenajud: renajud.detailRenajud,
      orgaoJudicial: renajud.judicialBody,
      restricoes: renajud.restrictions,
      tribunal: renajud.court,
    }));
  }
}
