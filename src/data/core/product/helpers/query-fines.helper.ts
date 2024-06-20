import { Injectable } from '@nestjs/common';
import { Currency, CurrencyUtil } from 'src/infrastructure/util/currency.util';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';
import {
  MyCarQueryFine,
  MyCarQueryFineDebts,
  MyCarQueryFines,
} from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { Debt, DebtRecord } from 'src/domain/value-object/debts-and-fines.vo';

@Injectable()
export class QueryFinesHelper {
  public static readonly QUERY_TEMPLATE: string = '3333';
  private static readonly PARTNER_LOGO: string = 'https://www.olhonocarro.com.br/img/brands/zapay-logo.svg';
  private static readonly PARTNER_DESCRIPTION: string =
    'Parcele suas Multas e Débitos em até 12X com a parceria Olhonocarro e Zapay. Simule seu parcelamento e deixe a gente te ajudar nessa!';
  private static readonly DEBT_TYPE_NAME: Record<string, string> = {
    none: 'Outros',
    ipva: 'IPVA',
    ipva_unique: 'IPVA',
    ipva_installment: 'IPVA',
    licensing: 'Licenciamento',
    ticket: 'Infrações de trânsito',
  };

  constructor(private readonly _currencyUtil: CurrencyUtil, private readonly _dateTimeUtil: DateTimeUtil) {}

  /**
   * the ideia that parse response is public because
   * this can be override to parse data
   * @returns MyCarQueryFines;
   */
  public parseResponse() {
    return ({ response }: QueryResponseDto): MyCarQueryFines => {
      const totalValue: number =
        response?.debtsAndFines?.debts?.reduce((prev: number, curr: Debt) => {
          return prev + curr.totalValueInCents;
        }, 0) || 0;

      const fines: ReadonlyArray<MyCarQueryFine> =
        response?.debtsAndFines?.debts?.map((debt: Debt) => {
          const debits: ReadonlyArray<MyCarQueryFineDebts> = debt.records.map((debits: DebtRecord) => ({
            isOverdue: this._isOverdue(debits.dueDate),
            info: debits.title,
            description: debits.description,
            emittedAt: this._parseDate(debits.dueDate),
            valor: this._parseCurrency(debits.amountInCents),
          }));

          return {
            totalValue: this._parseCurrency(debt.totalValueInCents),
            title: this._getTitle(debt.type),
            debits: debits,
          };
        }) || [];

      return {
        totalValue: this._parseCurrency(totalValue),
        fines: fines,
        partnerLogo: QueryFinesHelper.PARTNER_LOGO,
        partnerDescription: QueryFinesHelper.PARTNER_DESCRIPTION,
      };
    };
  }

  private _parseCurrency(value: number): string {
    return this._currencyUtil.numToCurrency(value, Currency.CENTS_PRECISION).toFormat();
  }

  private _getTitle(value: unknown): string {
    const key: string =
      typeof value === 'string' && QueryFinesHelper.DEBT_TYPE_NAME[value] !== undefined ? value : 'none';
    return QueryFinesHelper.DEBT_TYPE_NAME[key];
  }

  private _parseDate(date: string): string {
    try {
      if (!date) return null;

      return this._dateTimeUtil.fromDate(new Date(date)).toIso();
    } catch (error) {
      return null;
    }
  }

  private _isOverdue(date: string): boolean {
    if (!date) return false;
    const dateNow: Date = new Date();
    const responseDate: Date = new Date(date);
    return dateNow > responseDate;
  }
}
