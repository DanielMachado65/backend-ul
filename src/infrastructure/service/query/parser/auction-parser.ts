import { AuctionScoreVo, AuctionVo } from 'src/domain/value-object/auction.vo';
import {
  QueryAuctionRecordData,
  QueryAuctionScoreVo,
  QueryAuctionVo,
} from 'src/domain/value-object/query/query-auction.vo';

export class AuctionParser {
  static parse(auctions: ReadonlyArray<AuctionVo>, auctionScore: AuctionScoreVo): QueryAuctionVo {
    if (!Array.isArray(auctions)) return null;

    const messageHasAuctionLog: string = 'Consta registro de leilão para o veículo informado';
    const messageHasNOTAuctionLog: string = 'Não consta registro de leilão para o veículo informado';

    const description: string = auctions?.length > 0 ? messageHasAuctionLog : messageHasNOTAuctionLog;

    const records: ReadonlyArray<QueryAuctionRecordData> = auctions?.map((auction: AuctionVo) => ({
      anoFabricacao: auction?.manufactureYear,
      anoModelo: auction?.modelYear,
      chassi: auction?.chassis,
      comitente: auction?.principal,
      condicaoGeral: auction?.generalCondition,
      cor: auction?.color,
      dataLeilao: auction?.auctionDate,
      leiloeiro: auction?.auctioneer,
      lote: auction?.batch,
      marca: auction?.brand,
      modelo: auction?.model,
      observacao: null,
      placa: auction?.plate,
    }));

    const score: QueryAuctionScoreVo = {
      aceitacao: auctionScore?.acceptance ?? null,
      exigenciaVistoriaEspecial: auctionScore?.specialInspectionRequirement ?? null,
      percentualSobreRef: auctionScore?.percentageOverRef ?? null,
      pontuacao: auctionScore?.punctuation ?? null,
      score: auctionScore?.score ?? null,
    };

    return {
      descricao: description,
      registros: records,
      score,
    };
  }
}
