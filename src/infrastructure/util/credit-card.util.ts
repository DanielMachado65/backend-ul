import { Injectable } from '@nestjs/common';
import { CreditCardDto } from '../../domain/_layer/data/dto/credit-card.dto';
import { DateTime } from './date-time-util.service';

@Injectable()
export class CreditCardUtil {
  isValidHolderName(holderName: string): boolean {
    const pattern: RegExp = /^(\w ?)+$/;
    return pattern.test(holderName);
  }

  isValidExpirationDate(expirationDate: string): boolean {
    const pattern: RegExp = /^\d{2}\/\d{2}$/;
    if (!pattern.test(expirationDate)) return false;

    const [month, year]: ReadonlyArray<string> = expirationDate.split('/');
    const fullYear: string = CreditCardUtil._getYearPrefix() + year;
    const date: Date = new Date(Number(fullYear), Number(month), 0);
    return DateTime.fromDate(date).isPresentOrFuture();
  }

  isValidSecurityCode(securityCode: string): boolean {
    const pattern: RegExp = /^\d{3,4}$/;
    return pattern.test(securityCode);
  }

  getFirstName(creditCard: CreditCardDto): string {
    const names: ReadonlyArray<string> = creditCard.holderName.split(' ');
    return names.length > 0 ? names[0] : '';
  }

  getLastName(creditCard: CreditCardDto): string {
    const names: ReadonlyArray<string> = creditCard.holderName.split(' ');
    return names.length > 0 ? names[names.length - 1] : '';
  }

  getMonth(creditCard: CreditCardDto): string {
    const values: ReadonlyArray<string> = creditCard.expirationDate.split('/');
    return values.length > 0 ? values[0] : '';
  }

  year(creditCard: CreditCardDto): string {
    const values: ReadonlyArray<string> = creditCard.expirationDate.split('/');
    return values.length > 0 ? values[values.length - 1] : '';
  }

  getFullYear(creditCard: CreditCardDto): string {
    const year: string = this.year(creditCard);
    if (year === '') return year;
    return CreditCardUtil._getYearPrefix() + year;
  }

  private static _getYearPrefix(): string {
    return (DateTime.getCentury() - 1).toString();
  }
}
