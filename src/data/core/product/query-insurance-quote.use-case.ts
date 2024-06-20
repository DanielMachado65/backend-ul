import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { MyCarKeys } from 'src/domain/_entity/my-car-product.entity';
import {
  ProviderNoDataForSelectedVersion,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import {
  MyCarQueryInsuranceQuote,
  MyCarQueryInsuranceQuoteCoverage,
} from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { QueryInsuranceQuoteDomain, QueryInsuranceQuoteIO } from 'src/domain/core/product/query-insurance-quote.domain';
import { InsuranceQuoteCoverage, InsuranceQuotesVo } from 'src/domain/value-object/insurance-quotes.vo';
import { MyCarsQueryHelper } from './my-cars-query.helper';

type Coverage = {
  readonly order: number;
  readonly isIncluded: boolean;
  readonly name: string;
  readonly description: string;
};

@Injectable()
export class QueryInsuranceQuoteUseCase implements QueryInsuranceQuoteDomain {
  private static readonly TEMPLATE_QUERY: string = '6';
  private static readonly PIER_EXTERNAL_URL: string =
    'https://www.pier.digital/seguro-auto?utm_source=parceiro-olho-no-carro&utm_medium=pc&utm_campaign=at_3_11_lead_pc-onc_parceiro';
  private static readonly COVERAGES: ReadonlyMap<string, Coverage> = new Map()
    .set('robbery_and_theft', {
      order: 1,
      isIncluded: true,
      name: 'Roubo e Furto + Assistências',
      description:
        'Seu carro protegido contra roubo e Furto. Se precisar utilize nossa assistência 24 horas em qualquer lugar do país',
    })
    .set('unlimited_km', {
      order: 2,
      isIncluded: false,
      name: 'Km ilimitado de guincho',
      description:
        'Ao adicionar esse benefício, você poderá utilizar o serviço de guincho para descolar o seu carro ao local desejado sem restrições de quilometragem (Km)',
    })
    .set('total_loss', {
      order: 3,
      isIncluded: false,
      name: 'Perda total',
      description: 'Cobrimos todos os tipos de perda total do seu veículo, incluindo incêndio e desastres da natureza',
    })
    .set('partial_loss', {
      order: 4,
      isIncluded: false,
      name: 'Perda parcial',
      description:
        'Cobrimos o conserto do carro em caso de acidentes, incluindo batidas, incêndio e desastres da natureza mediante pagamento de uma franquia',
    });

  constructor(private readonly _helper: MyCarsQueryHelper) {}

  execute(userId: string, carId: string, zipCode: string): QueryInsuranceQuoteIO {
    return this._helper.getCar(userId, carId).flatMap(this._processQuery(zipCode));
  }

  private _processQuery(zipCode: string): (carDto: MyCarProductWithUserDto) => QueryInsuranceQuoteIO {
    return (carDto: MyCarProductWithUserDto) => {
      return EitherIO.from(UnknownDomainError.toFn(), this._requestQuery(carDto, zipCode))
        .map(this._helper.getResponse(45_000))
        .filter(ProviderUnavailableDomainError.toFn(), this._helper.isValidQuery())
        .filter(ProviderNoDataForSelectedVersion.toFn(), this._canBeParsed(carDto))
        .map(this._parseResponse(carDto));
    };
  }

  private _requestQuery(carDto: MyCarProductWithUserDto, zipCode: string): () => Promise<string> {
    return () => {
      const keys: MyCarKeys = carDto.keys;
      return this._helper.requestQuery(QueryInsuranceQuoteUseCase.TEMPLATE_QUERY)({
        ...carDto,
        keys: { ...keys, zipCode } as MyCarKeys,
      });
    };
  }

  private _filterByFipe(
    insuranceQuotes: ReadonlyArray<InsuranceQuotesVo>,
    fipeId: string,
  ): ReadonlyArray<InsuranceQuotesVo> {
    return insuranceQuotes.filter((insuranceQuote: InsuranceQuotesVo) => insuranceQuote.fipeId === fipeId);
  }

  private _canBeParsed(carDto: MyCarProductWithUserDto) {
    return ({ response }: QueryResponseDto): boolean => {
      const items: ReadonlyArray<InsuranceQuotesVo> = this._filterByFipe(response.insuranceQuotes, carDto.keys.fipeId);
      return Array.isArray(items) && items.length > 0;
    };
  }

  private _parseResponse(carDto: MyCarProductWithUserDto): (dto: QueryResponseDto) => MyCarQueryInsuranceQuote {
    return ({ response }: QueryResponseDto): MyCarQueryInsuranceQuote => {
      const fipeId: string = carDto.keys.fipeId;
      const fipeName: string = carDto.keys.fipeName;
      const coverages: ReadonlyArray<MyCarQueryInsuranceQuoteCoverage> = this._filterByFipe(
        response.insuranceQuotes,
        fipeId,
      )
        .flatMap((insuranceQuote: InsuranceQuotesVo) => insuranceQuote.coverages)
        .map((coverage: InsuranceQuoteCoverage) => {
          const insurance: Coverage = QueryInsuranceQuoteUseCase.COVERAGES.get(coverage.kind);
          return (
            insurance && {
              order: insurance.order,
              name: insurance.name,
              description: insurance.description,
              isIncluded: insurance.isIncluded,
              type: coverage.kind,
              priceInCents: coverage.priceCents,
            }
          );
        })
        .filter(Boolean)
        .sort((a: MyCarQueryInsuranceQuoteCoverage, b: MyCarQueryInsuranceQuoteCoverage) => a.order - b.order);

      return {
        externalUrl: QueryInsuranceQuoteUseCase.PIER_EXTERNAL_URL,
        vehicleVersion: fipeName,
        coverages: coverages,
      };
    };
  }
}
