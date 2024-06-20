import { SignOfAccidentVo } from 'src/domain/value-object/evidence-of-theft.vo';
import { QuerySignOfAccidentVo } from 'src/domain/value-object/query/query-sign-of-accident.vo';

export class SignOfAccidentParser {
  static parse(signOfAccident: SignOfAccidentVo): QuerySignOfAccidentVo {
    if (signOfAccident === null || signOfAccident === undefined) return null;

    const messageWhenHaveSinister: string = 'CONSTA INDÍCIO DE SINISTRO PARA O VEÍCULO INFORMADO 😑';
    const messageWhenNotHaveSinister: string = 'NÃO CONSTA INDÍCIO DE SINISTRO PARA O VEÍCULO INFORMADO 😃';

    const description: string = signOfAccident?.hasSignOfAccident
      ? messageWhenHaveSinister
      : messageWhenNotHaveSinister;
    return {
      descricao: description,
    };
  }
}
