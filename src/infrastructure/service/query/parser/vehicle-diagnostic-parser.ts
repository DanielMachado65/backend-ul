import {
  QuerySolutionsDiagnosticData,
  QuerySpecificParameterData,
  QueryVehicleDiagnosticCrashListData,
  QueryVehicleDiagnosticSpecificData,
  QueryVehicleDiagnosticVo,
} from 'src/domain/value-object/query/query-vehicle-diagnostic.vo';
import {
  SpecificDiagnosticData,
  SpecificParameterData,
  VehicleDiagnosticCrashListData,
  VehicleDiagnosticSolution,
  VehicleDiagnosticVo,
} from 'src/domain/value-object/vehicle-diagnostic.vo';

export class VehicleDiagnosticParser {
  static parse(vehicleDiagnostic: VehicleDiagnosticVo): QueryVehicleDiagnosticVo {
    if (vehicleDiagnostic === null || vehicleDiagnostic === undefined) return null;

    const querySpecificData: ReadonlyArray<QueryVehicleDiagnosticSpecificData> = vehicleDiagnostic?.specific?.map(
      (diagnostic: SpecificDiagnosticData) => ({
        dataHora: diagnostic?.dateTime,
        listaFalhas: diagnostic?.crashList?.map(VehicleDiagnosticParser._parseVehicleDiagnosticCrashList),
        odometro: diagnostic?.odometer,
        parametros: diagnostic?.parameters?.map(VehicleDiagnosticParser._parseVehicleDiagnosticSpecificParameter),
      }),
    );

    const queryGenericCrashList: ReadonlyArray<QueryVehicleDiagnosticCrashListData> = vehicleDiagnostic?.generic?.map(
      VehicleDiagnosticParser._parseVehicleDiagnosticCrashList,
    );

    return {
      especifico: {
        diagnostico: querySpecificData,
      },
      generico: {
        listaFalhas: queryGenericCrashList,
      },
    };
  }

  private static _parseVehicleDiagnosticSpecificParameter(
    paramenter: SpecificParameterData,
  ): QuerySpecificParameterData {
    return {
      descricao: paramenter?.description,
      unidade: paramenter?.unit,
      valor: paramenter?.value,
    };
  }

  private static _parseVehicleDiagnosticCrashList(
    crash: VehicleDiagnosticCrashListData,
  ): QueryVehicleDiagnosticCrashListData {
    const querySolutions: ReadonlyArray<QuerySolutionsDiagnosticData> = crash?.solutions?.map(
      ({ description }: VehicleDiagnosticSolution) => ({
        descricao: description,
      }),
    );

    return {
      descricao: crash?.description,
      dtc: crash?.dtc,
      ocorrencias: crash?.occurrences,
      porcentagemOcorrida: crash?.occurrencesPercentage,
      solucao: querySolutions,
      totalDiagnosticos: crash?.totalDiagnostics,
    };
  }
}
