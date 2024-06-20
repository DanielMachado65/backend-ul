import { Injectable } from '@nestjs/common';
import * as Dinero from 'dinero.js';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line functional/immutable-data
Dinero.globalLocale = 'pt-BR';

type Money = ReturnType<typeof Dinero>;

export class Currency {
  static readonly CENTS_PRECISION: number = 2;
  static readonly DEFAULT_PRECISION: number = 0;

  private readonly _money: Money;

  constructor(currency: Money) {
    this._money = currency;
  }

  get money(): Money {
    return this._money;
  }

  add(currency: Currency): Currency {
    return new Currency(this._money.add(currency.money));
  }

  addValue(value: number, precision: number = Currency.DEFAULT_PRECISION): Currency {
    const currency: Currency = new CurrencyUtil().numToCurrency(value, precision);
    return this.add(currency);
  }

  minus(currency: Currency): Currency {
    return new Currency(this._money.subtract(currency.money));
  }

  minusValue(value: number, precision: number = Currency.DEFAULT_PRECISION): Currency {
    const currency: Currency = new CurrencyUtil().numToCurrency(value, precision);
    return this.minus(currency);
  }

  multiply(value: number): Currency {
    return new Currency(this._money.multiply(value));
  }

  divide(value: number): Currency {
    return new Currency(this._money.divide(value));
  }

  equalsTo(currency: Currency): boolean {
    return this._money.equalsTo(currency.money);
  }

  equalsToValue(value: number, precision: number = Currency.DEFAULT_PRECISION): boolean {
    const currency: Currency = new CurrencyUtil().numToCurrency(value, precision);
    return this.equalsTo(currency);
  }

  lessThan(currency: Currency): boolean {
    return this._money.lessThan(currency.money);
  }

  lessThanValue(value: number, precision: number = Currency.DEFAULT_PRECISION): boolean {
    const currency: Currency = new CurrencyUtil().numToCurrency(value, precision);
    return this.lessThan(currency);
  }

  lessThanOrEqual(currency: Currency): boolean {
    return this._money.lessThanOrEqual(currency.money);
  }

  lessThanOrEqualValue(value: number, precision: number = Currency.DEFAULT_PRECISION): boolean {
    const currency: Currency = new CurrencyUtil().numToCurrency(value, precision);
    return this.lessThanOrEqual(currency);
  }

  greaterThan(currency: Currency): boolean {
    return this._money.greaterThan(currency.money);
  }

  greaterThanValue(value: number, precision: number = Currency.DEFAULT_PRECISION): boolean {
    const currency: Currency = new CurrencyUtil().numToCurrency(value, precision);
    return this.greaterThan(currency);
  }

  greaterThanOrEqual(currency: Currency): boolean {
    return this._money.greaterThanOrEqual(currency.money);
  }

  greaterThanOrEqualValue(value: number, precision: number = Currency.DEFAULT_PRECISION): boolean {
    const currency: Currency = new CurrencyUtil().numToCurrency(value, precision);
    return this.greaterThanOrEqual(currency);
  }

  isZero(): boolean {
    return this._money.isZero();
  }

  isPositive(): boolean {
    return this._money.isPositive();
  }

  isNegative(): boolean {
    return this._money.isNegative();
  }

  hasCents(): boolean {
    return this._money.hasSubUnits();
  }

  toFormat(): string {
    return this._money.toFormat();
  }

  toFloat(): number {
    return this._money.toUnit();
  }

  toInt(): number {
    return this._money.getAmount();
  }
}

@Injectable()
export class CurrencyUtil {
  toCurrency(amount: number, precision: number = Currency.DEFAULT_PRECISION): Currency {
    const currency: Money = Dinero({ amount, precision, currency: 'BRL' }).convertPrecision(2);
    return new Currency(currency);
  }

  numToCurrency(amountAsNumber: number, precision: number = Currency.DEFAULT_PRECISION): Currency {
    try {
      const [int, cents]: ReadonlyArray<string> = amountAsNumber.toString(10).trim().split(/[.,]/);

      if (cents && typeof cents === 'string' && cents.length > 0) {
        const amount: number = parseInt(int + cents);
        return this.toCurrency(amount, cents.length);
      } else {
        const amount: number = parseInt(int);
        return this.toCurrency(amount, precision);
      }
    } catch (error) {
      return this.toCurrency(0);
    }
  }

  strToCurrency(amountAsString: string, precision: number = Currency.DEFAULT_PRECISION): Currency {
    try {
      const amount: number = parseFloat(amountAsString);
      return this.numToCurrency(amount, precision);
    } catch (error) {
      return this.numToCurrency(0);
    }
  }
}
