import { FipeDataVo } from 'src/domain/value-object/fipe-data.vo';
import { InsuranceQuoteCoverage, InsuranceQuotesVo } from 'src/domain/value-object/insurance-quotes.vo';
import {
  QueryInsuranceQuoteCoverage,
  QueryInsuranceQuoteVersion,
  QueryInsuranceQuoteVo,
} from 'src/domain/value-object/query/query-insurance-quote.vo';

export class InsuranceQuotesParser {
  static parse(
    insuranceQuotes: ReadonlyArray<InsuranceQuotesVo>,
    fipeData: ReadonlyArray<FipeDataVo>,
  ): QueryInsuranceQuoteVo {
    if (!Array.isArray(insuranceQuotes)) return { versoes: [] };

    const versions: ReadonlyArray<QueryInsuranceQuoteVersion> = insuranceQuotes?.map(
      (insuranceQuote: InsuranceQuotesVo) => {
        const fipe: FipeDataVo = fipeData?.find((fipe: FipeDataVo) => fipe.fipeId === insuranceQuote.fipeId);

        return {
          anoModelo: insuranceQuote.modelYear,
          codigoFipe: insuranceQuote.fipeId,
          modelo: insuranceQuote.model,
          versao: fipe?.version ?? null,
          coberturas: InsuranceQuotesParser._parseInsuranceQuotesCoverages(insuranceQuote?.coverages),
        };
      },
    );

    return {
      versoes: versions,
    };
  }

  private static _parseInsuranceQuotesCoverages(
    coverages: ReadonlyArray<InsuranceQuoteCoverage>,
  ): ReadonlyArray<QueryInsuranceQuoteCoverage> {
    if (!Array.isArray(coverages)) return [];
    return coverages
      .filter((coverage: InsuranceQuoteCoverage) => !!coverage.kind)
      .map((coverage: InsuranceQuoteCoverage) => ({
        precoEmCentavos: coverage.priceCents?.toString() ?? null,
        tipoSeguro: coverage.kind,
        razoesDeRecusca: null,
      }));
  }
}
