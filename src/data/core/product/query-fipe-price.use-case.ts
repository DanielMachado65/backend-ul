import { Injectable } from '@nestjs/common';
import { ProviderNoDataForSelectedVersion } from 'src/domain/_entity/result.error';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import {
  MyCarQueryPriceFIPE,
  MyCarQueryPriceFIPELastYearsValuationDevaluation,
  MyCarQueryPriceFIPEPriceLast6Months,
} from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { QueryFipePriceDomain, QueryFipePriceIO } from 'src/domain/core/product/query-fipe-price.domain';
import {
  BasicVehicleFipePriceHistory,
  BasicVehicleFipeVo,
  BasicVehicleVo,
} from 'src/domain/value-object/basic-vechicle.vo';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';
import { MyCarsQueryHelper } from './my-cars-query.helper';

@Injectable()
export class QueryFipePriceUseCase implements QueryFipePriceDomain {
  private static readonly TEMPLATE_QUERY: string = '999';

  constructor(
    private readonly _myCarsQueryHelper: MyCarsQueryHelper,
    private readonly _dateTimeUtil: DateTimeUtil,
    private readonly _currencyUtil: CurrencyUtil,
  ) {}

  private _calculateDevaluation(start: number, end: number): number {
    return ((end - start) / start) * 100;
  }

  private _filterByFipe(basicVehicle: BasicVehicleVo, fipeId: string): ReadonlyArray<BasicVehicleFipePriceHistory> {
    return basicVehicle.fipeData
      .filter((priceHistory: BasicVehicleFipeVo) => priceHistory.fipeId.toString() === fipeId)
      .flatMap((priceHistory: BasicVehicleFipeVo) => priceHistory.priceHistory);
  }

  private _getDevaluationByYear(
    basicVehicle: BasicVehicleVo,
    fipeId: string,
  ): ReadonlyArray<MyCarQueryPriceFIPELastYearsValuationDevaluation> {
    const record: Record<string, ReadonlyArray<BasicVehicleFipePriceHistory>> = this._filterByFipe(
      basicVehicle,
      fipeId,
    ).reduce(
      (acc: Record<string, ReadonlyArray<BasicVehicleFipePriceHistory>>, entry: BasicVehicleFipePriceHistory) => {
        const year: string = entry.year + '';
        const currentEntries: ReadonlyArray<BasicVehicleFipePriceHistory> = acc[year] || [];
        acc[year] = [...currentEntries, entry];
        return acc;
      },
      {},
    );

    return Object.keys(record).map((year: string) => {
      const periodYear: ReadonlyArray<BasicVehicleFipePriceHistory> = record[year];
      const start: number = periodYear[0].price;
      const end: number = periodYear[periodYear.length - 1].price;
      const devaluation: number = this._calculateDevaluation(start, end);

      return {
        period: year,
        percent: devaluation.toString(),
      };
    });
  }

  private _lastYearsValuationDevaluation(
    basicVehicle: BasicVehicleVo,
    fipeId: string,
  ): ReadonlyArray<MyCarQueryPriceFIPELastYearsValuationDevaluation> {
    const devaluationByYear: ReadonlyArray<MyCarQueryPriceFIPELastYearsValuationDevaluation> =
      this._getDevaluationByYear(basicVehicle, fipeId);

    return devaluationByYear.map((devaluation: MyCarQueryPriceFIPELastYearsValuationDevaluation) => {
      const percent: number = Number(devaluation.percent);

      return {
        percent: `${percent.toFixed(2)}%`,
        period: devaluation.period,
      };
    });
  }

  private _calculateTotalVariation(basicVehicle: BasicVehicleVo, fipeId: string): string {
    const devaluationByYear: ReadonlyArray<MyCarQueryPriceFIPELastYearsValuationDevaluation> =
      this._getDevaluationByYear(basicVehicle, fipeId);

    const total: number = devaluationByYear.reduce(
      (prev: number, curr: MyCarQueryPriceFIPELastYearsValuationDevaluation) => {
        const value: number = Number(curr.percent);
        // eslint-disable-next-line no-param-reassign
        prev += value;
        return prev;
      },
      0,
    );

    return `${total.toFixed(2)}%`;
  }

  private _createVehicleName(basicVehicle: BasicVehicleVo): string {
    return `${basicVehicle.brand} ${basicVehicle.model} ${basicVehicle.version}`;
  }

  private _calculateSixMonths(basicVehicle: BasicVehicleVo, fipeId: string): string {
    const sixMonths: ReadonlyArray<BasicVehicleFipePriceHistory> = this._filterByFipe(basicVehicle, fipeId).slice(0, 6);
    const start: number = sixMonths[0].price;
    const end: number = sixMonths[sixMonths.length - 1].price;
    const devaluation: number = this._calculateDevaluation(start, end);
    return `${devaluation.toFixed(2)}%`;
  }

  private _calculateTwelveMonths(basicVehicle: BasicVehicleVo, fipeId: string): string {
    const twelveMonths: ReadonlyArray<BasicVehicleFipePriceHistory> = this._filterByFipe(basicVehicle, fipeId).slice(
      0,
      12,
    );
    const start: number = twelveMonths[0].price;
    const end: number = twelveMonths[twelveMonths.length - 1].price;
    const devaluation: number = this._calculateDevaluation(start, end);
    return `${devaluation.toFixed(2)}%`;
  }

  private _getLastSixMonths(
    basicVehicle: BasicVehicleVo,
    fipeId: string,
  ): ReadonlyArray<MyCarQueryPriceFIPEPriceLast6Months> {
    return this._filterByFipe(basicVehicle, fipeId)
      .slice(0, 6)
      .map((priceHistory: BasicVehicleFipePriceHistory) => {
        const formatDate: string = this._dateTimeUtil
          .fromDate(new Date(`${priceHistory.year}/${priceHistory.month}`))
          .format('MMM/YYYY');
        const currency: string = this._currencyUtil.toCurrency(priceHistory.price / 100).toFormat();

        return {
          x: formatDate,
          y: currency,
        };
      });
  }

  private _canBeParsed() {
    return ({ response, keys }: QueryResponseDto): boolean => {
      const basicVehicle: BasicVehicleVo = response.basicVehicle;
      const fipeId: string = keys.fipeId;
      const items: ReadonlyArray<BasicVehicleFipePriceHistory> = this._filterByFipe(basicVehicle, fipeId);
      return Array.isArray(items) && items.length > 0;
    };
  }

  private _parseResponse() {
    return ({ response, keys }: QueryResponseDto): MyCarQueryPriceFIPE => {
      const basicVehicle: BasicVehicleVo = response.basicVehicle;
      const fipeId: string = keys.fipeId;

      return {
        totalVariation: this._calculateTotalVariation(basicVehicle, fipeId),
        vehicleName: this._createVehicleName(basicVehicle),
        lastMonthsValuationDevaluation: {
          '6months': this._calculateSixMonths(basicVehicle, fipeId),
          '12months': this._calculateTwelveMonths(basicVehicle, fipeId),
        },
        lastYearsValuationDevaluation: this._lastYearsValuationDevaluation(basicVehicle, fipeId),
        priceLast6Months: this._getLastSixMonths(basicVehicle, fipeId),
      };
    };
  }

  execute(userId: string, carId: string): QueryFipePriceIO {
    return this._myCarsQueryHelper
      .getCar(userId, carId)
      .map(this._myCarsQueryHelper.requestQuery(QueryFipePriceUseCase.TEMPLATE_QUERY))
      .map(this._myCarsQueryHelper.getResponse(45_000))
      .filter(ProviderNoDataForSelectedVersion.toFn(), this._canBeParsed())
      .map(this._parseResponse());
  }
}
