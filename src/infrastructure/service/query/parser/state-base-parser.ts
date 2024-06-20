import { QueryStateBaseVo } from 'src/domain/value-object/query/query-state-base.vo';
import { StateBaseVo } from 'src/domain/value-object/state-base.vo';

export class StateBaseParser {
  static parse(stateBase: StateBaseVo): Partial<QueryStateBaseVo> {
    if (stateBase === null || stateBase === undefined) return null;
    return {
      categoria: stateBase?.category,
      chassi: stateBase?.chassis,
      combustivel: stateBase?.fuel,
      cor: stateBase?.color,
      uf: stateBase?.uf,
      renavam: stateBase?.renavam,
      motor: stateBase?.engineNumber,
      placa: stateBase?.plate,
      especie: stateBase?.vehicleSpecie,
      pronome: stateBase?.ownerName,
      pronomeAnterior: stateBase?.previousOwnerName,
      tipo: stateBase?.vehicleType,
      municipio: stateBase?.city,
      licdata: stateBase?.licdata?.toLocaleString(),
      comunicacaoInclusao: stateBase?.restrictions?.salesCommunication?.description,
      dataEmissaoCrv: stateBase?.transmissionCRVDate?.toLocaleString(),
      situacaoVeiculo: stateBase?.vehicleSituation,
      observacoes: stateBase?.comments,
      tipoMarcacaoChassi: stateBase?.chassisBrandType,
      comunicacaoVenda: stateBase?.restrictions?.communicationInclusion?.description,
      dataInclusaoIntencaoTrocaFinanceira: stateBase?.restrictions?.financialInclusionDate?.description,
      dataLimiteRestricaoTributaria: stateBase?.taxRestrictionLimitDate?.toLocaleString(),
      dataVenda: null,
      dataVigenciaContratoFinanceira: stateBase?.dateValidityFinancialContract?.toLocaleString(),
      debitoCetesb: stateBase?.restrictions?.debtCetesb?.value?.toString(),
      debitoDer: stateBase?.restrictions?.debtDer?.value?.toString(),
      debitoDersa: stateBase?.restrictions?.debtDersa?.value?.toString(),
      debitoDetran: stateBase?.restrictions?.debtDetran?.value?.toString(),
      debitoDpvat: stateBase?.restrictions?.debtDpvat?.value?.toString(),
      debitoIpva: stateBase?.restrictions?.debtIpva?.value?.toString(),
      debitoLicenciamento: stateBase?.restrictions?.debtLicensing?.value?.toString(),
      debitoMultas: stateBase?.restrictions?.debtTheft?.value?.toString(),
      debitoMunicipais: stateBase?.restrictions?.municipalDebt?.value?.toString(),
      debitoPoliciaRodoviariaFederal: stateBase?.restrictions?.debtPolrodfed?.value?.toString(),
      debitoRenainf: stateBase?.restrictions?.debtRenainf?.value?.toString(),
      exercicioLicenciamento: stateBase?.licensingExercise,
      existeDebitoDpvat: stateBase?.restrictions?.debtDpvat?.description,
      existeDebitoIpva: stateBase?.restrictions?.debtIpva?.description,
      existeDebitoLicenciamento: stateBase?.restrictions?.debtLicensing?.description,
      existeDebitoMulta: stateBase?.restrictions?.debtTheft?.description,
      intencaoDataInslusao: stateBase?.restrictions?.intentionInclusionDate?.description,
      intencaoDocFinanceira: stateBase?.intentionDocFinance,
      intencaoNomeFinanceira: stateBase?.restrictions?.intentionFinancName?.description,
      intencaoRestricaoFinanceira: stateBase?.restrictions?.intentionRestrictionFinan?.description,
      outrasRestricoes1: stateBase?.restrictions?.othersRestrictions1?.description,
      outrasRestricoes2: stateBase?.restrictions?.othersRestrictions2?.description,
      outrasRestricoes3: stateBase?.restrictions?.othersRestrictions3?.description,
      outrasRestricoes4: stateBase?.restrictions?.othersRestrictions4?.description,
      restricaoAdminisrativa: stateBase?.restrictions?.administavive?.description,
      restricaoAmbiental: stateBase?.restrictions?.restrictionsEnvironmental?.description,
      restricaoArrendatario: stateBase?.restrictions?.restrictionsArrenadatario?.description,
      restricaoDataInclusao: stateBase?.inclusionRestrictionDate?.toLocaleString(),
      restricaoDocArrendatario: stateBase?.restrictions?.cpfCnpjArrenadatar?.description,
      restricaoFinanceira: null, // Not used
      restricaoGuincho: stateBase?.restrictions?.winchBlockade?.description,
      restricaoJudicial: stateBase?.restrictions?.restrictionsJudicial?.description,
      restricaoNomeAgente: stateBase?.restrictions?.intentionAgentName?.description,
      restricaoRenajud: stateBase?.restrictions?.restrictionsRenajud?.description,
      restricaoRouboFurto: stateBase?.restrictions?.restrictionsTheft?.description,
      restricaoTributaria: stateBase?.restrictions?.restrictionsTaxation?.description,
    };
  }
}