import { EvidenceOfTheftVo } from 'src/domain/value-object/evidence-of-theft.vo';
import { QueryEvidenceOfTheftVo } from 'src/domain/value-object/query/query-evidence-of-theft.vo';

export class EvidenceOfTheftParser {
  static parse(evidenceOfTheft: EvidenceOfTheftVo): QueryEvidenceOfTheftVo {
    if (evidenceOfTheft === null || evidenceOfTheft === undefined) return null;

    const messageWhenHaveSinister: string = 'CONSTA INDÍCIO DE SINISTRO PARA O VEÍCULO INFORMADO 😑';
    const messageWhenNotHaveSinister: string = 'NÃO CONSTA INDÍCIO DE SINISTRO PARA O VEÍCULO INFORMADO 😃';

    const description: string = evidenceOfTheft?.hasTheft ? messageWhenHaveSinister : messageWhenNotHaveSinister;
    return {
      descricao: description,
    };
  }
}
