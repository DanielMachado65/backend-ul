import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import * as isLeapYear from 'dayjs/plugin/isLeapYear';
import * as isoWeek from 'dayjs/plugin/isoWeek';

export type DateTimeUnitType = dayjs.OpUnitType | dayjs.QUnitType;
export type DateTimeManipulateType = dayjs.ManipulateType;

export class DateTime {
  private readonly _date: dayjs.Dayjs;

  private constructor(date: dayjs.Dayjs) {
    this._date = date;
  }

  static fromDate(date: Date): DateTime {
    return new DateTime(dayjs(date));
  }

  static fromIso(isoDate: string): DateTime {
    return new DateTime(dayjs(isoDate));
  }

  static now(): DateTime {
    return new DateTime(dayjs());
  }

  static getCentury(): number {
    const currentYear: number = DateTime.now().getYear();
    const centuryAsStr: string = (currentYear + 100).toString().substring(0, 2);
    return Number(centuryAsStr);
  }

  format(template: string): string {
    return this._date.format(template);
  }

  isPresentOrFuture(): boolean {
    return this._date.diff(dayjs(), 'month') >= 0;
  }

  getDayOfMonth(): number {
    return this._date.date();
  }

  getDayOfWeek(): number {
    return this._date.day();
  }

  getMonth(): number {
    return this._date.month();
  }

  getMonthFrom1(): number {
    return this._date.month() + 1;
  }

  getYear(): number {
    return this._date.year();
  }

  getMonthAndDay(isoDate: string): string {
    return dayjs(isoDate).format('MM/DD');
  }

  firstDayOfMonth(): DateTime {
    return new DateTime(this._date.startOf('month'));
  }

  lastDayOfMonth(): DateTime {
    return new DateTime(this._date.endOf('month'));
  }

  add(value: number, unitType: DateTimeManipulateType): DateTime {
    return new DateTime(this._date.add(value, unitType));
  }

  subtract(value: number, unitType: DateTimeManipulateType): DateTime {
    return new DateTime(this._date.subtract(value, unitType));
  }

  diffIso(isoDate: string, measureUnitType?: DateTimeUnitType): number {
    const date: dayjs.Dayjs = dayjs(isoDate);
    return measureUnitType ? this._date.diff(date, measureUnitType) : this._date.diff(date);
  }

  diff(dateTime: DateTime, measureUnitType?: DateTimeUnitType): number {
    return this.diffIso(dateTime.toIso(), measureUnitType);
  }

  pastAtLeast15Minutes(): boolean {
    return dayjs().diff(this._date, 'minute') >= 15;
  }

  toDate(): Date {
    return this._date.toDate();
  }

  toIso(): string {
    return this._date.toISOString();
  }

  toSeconds(): number {
    return this.toDate().getTime() / 1000;
  }

  getBrazilianDateFormat(): string {
    const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('pt-br', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    return formatter.format(this.toDate());
  }

  getOpenJobDate(): string {
    const dateNow: dayjs.Dayjs = this._date;
    const hour: number = dateNow.hour();

    if (hour > 20 || hour < 8) {
      const maybeOneDay: number = hour > 20 ? 1 : 0;
      return dateNow.hour(8).add(maybeOneDay, 'day').toISOString();
    }

    return dateNow.add(60, 'second').toISOString();
  }
}

@Injectable()
export class DateTimeUtil {
  constructor() {
    dayjs.locale('pt-br');
    dayjs.extend(isLeapYear);
    dayjs.extend(isoWeek);
  }

  fromDate(date: Date): DateTime {
    return DateTime.fromDate(date);
  }

  fromIso(isoDate: string): DateTime {
    return DateTime.fromIso(isoDate);
  }

  now(): DateTime {
    return DateTime.now();
  }
}
