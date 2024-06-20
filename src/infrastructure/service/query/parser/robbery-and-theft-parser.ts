import { QueryRobberyAndTheftVo } from 'src/domain/value-object/query/query-robbery-and-theft.vo';
import { RobberyAndTheftHistoricData, RobberyAndTheftVo } from 'src/domain/value-object/robbery-and-theft.vo';

export class RobberyAndTheftParser {
  static parse(robberyAndTheft: RobberyAndTheftVo): QueryRobberyAndTheftVo {
    if (robberyAndTheft === null || robberyAndTheft === undefined) return null;
    return {
      constaOcorrencia: robberyAndTheft?.containsOccurrence,
      constaOcorrenciaAtiva: robberyAndTheft?.containsActiveOccurrence,
      historico: robberyAndTheft?.historic?.map((historic: RobberyAndTheftHistoricData) => ({
        chassi: historic?.chassis,
        cor: historic?.color,
        boletim: historic?.reportCard,
        dataOcorrencia: historic?.occurrenceDate,
        declaracao: historic?.declaration,
        marcaModelo: historic?.modelBrand,
        municipioOcorrencia: historic?.occurrenceCity,
        ocorrencia: historic?.occurrence,
        placa: historic?.plate,
        ufOcorrencia: historic.ufOccurrence,
      })),
      indicadorProcedencia: robberyAndTheft?.indicatorProvenance,
      municipioEmplacamento: robberyAndTheft?.licencePlateCity,
    };
  }
}
