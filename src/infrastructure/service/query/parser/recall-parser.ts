import { QueryRecallVo } from 'src/domain/value-object/query/query-recall.vo';
import { PendingRecall, RecallDetail, RecallVo } from 'src/domain/value-object/recall.vo';

export class RecallParser {
  static parse(recall: RecallVo): QueryRecallVo {
    if (recall === null || recall === undefined) return null;
    return {
      anoModelo: recall.modelYear?.toString() ?? null,
      chassi: recall.chassis,
      descricaoRetorno: recall.returnDescription,
      marca: recall.brand,
      modelo: recall.model,
      detalhes: recall.details?.map((detail: RecallDetail) => ({
        codigoProcon: null,
        dataInicioCampanha: detail.campaignStartDate ?? null,
        defeito: detail.defect,
        descricaoCompleta: detail.fullDescription,
        risco: detail.risk,
        gravidade: null,
        sujeitoConfirmacaoPelaMontadora: null,
        telefoneConfirmacao: null,
      })),
      recallsPendente: recall.pendingRecalls?.map((pendingRecall: PendingRecall) => ({
        dataDoRegistro: pendingRecall?.recordDate ?? null,
        descricao: pendingRecall?.description,
        identificador: pendingRecall?.identifier,
        situacao: pendingRecall?.situation,
      })),
    };
  }
}
