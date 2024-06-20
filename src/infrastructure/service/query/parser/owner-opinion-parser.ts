import { OwnerOpinionVo } from 'src/domain/value-object/owner-opinion.vo';
import { QueryOwnerOpinionVo } from 'src/domain/value-object/query/query-owner-opinion.vo';

export class OwnerOpinionParser {
  static parse(ownerOpinion: OwnerOpinionVo): QueryOwnerOpinionVo {
    if (ownerOpinion === null || ownerOpinion === undefined) return { score: null };
    return {
      score: {
        conforto: ownerOpinion?.comfort,
        cambio: ownerOpinion?.cambium,
        consumoNaCidade: ownerOpinion?.cityConsumption,
        consumoNaEstrada: ownerOpinion?.roadConsumption,
        performance: ownerOpinion?.performance,
        dirigibilidade: ownerOpinion?.drivability,
        espacoInterno: ownerOpinion?.internalSpace,
        estabilidade: ownerOpinion?.stability,
        freios: ownerOpinion?.brakes,
        portaMalas: ownerOpinion?.trunk,
        suspensao: ownerOpinion?.suspension,
        custoBeneficio: ownerOpinion?.costBenefit,
        totalScore: ownerOpinion?.totalScore,
      },
    };
  }
}
