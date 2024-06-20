import { PartnerInformationsOptionals, PartnerInformationsVo } from 'src/domain/value-object/partner-informations.vo';
import { QueryAd } from 'src/domain/value-object/query/query-partner-informations.vo';

export class PartnerInformationsParser {
  static parseQueryAd(partnerInformations: PartnerInformationsVo): QueryAd {
    if (partnerInformations === null || partnerInformations === undefined) return null;

    return {
      data: partnerInformations?.date?.toLocaleString(),
      km: partnerInformations?.km,
      observacao: partnerInformations?.notation,
      placa: partnerInformations?.plate,
      valor: partnerInformations?.value,
      opcionais: partnerInformations?.optionals?.map((optional: PartnerInformationsOptionals) => ({
        descricao: optional?.description,
      })),
      fotosRaw: partnerInformations?.photos,
      fotos: partnerInformations?.photos?.map((photo: string) => ({ url: photo })),
    };
  }
}
