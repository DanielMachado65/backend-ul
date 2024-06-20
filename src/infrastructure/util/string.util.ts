import { Injectable } from '@nestjs/common';

export type CamelCase<Value extends string> = Value extends `${infer P1}${'_' | '-'}${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<Value>;

export type PascalCase<Value extends string> = Capitalize<CamelCase<Value>>;

/** Needs to be injected */
@Injectable()
export class StringUtil {
  static nameValidationRegex: RegExp = /^[\p{L} .'-]+$/iu;
  static regexForFirstLetterOnEachWord: RegExp = /(?<=^|\s)\S/g;

  static normalizeString(str: string): string {
    return str
      .trim()
      .replace(/\s+/g, ' ') // remove duplicated spaces
      .normalize('NFD') // normalize unicode to remove accents
      .replace(/([\u0300-\u036f]|[^0-9a-zA-Z\s])/g, '') // remove accents
      .toLowerCase();
  }

  static toCamelCase<Str extends string>(str: Str): CamelCase<Str> {
    return str
      .trim()
      .toLowerCase()
      .split('_')
      .map((word: string, index: number) => {
        if (index === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('') as CamelCase<Str>;
  }

  static toPascalCase<Str extends string>(str: Str): PascalCase<Str> {
    const camelStr: string = StringUtil.toCamelCase(str);
    return (camelStr.charAt(0).toUpperCase() + camelStr.slice(1)) as PascalCase<Str>;
  }

  static capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static capitalizeEachWord(str: string): string {
    return str.replace(StringUtil.regexForFirstLetterOnEachWord, (letter: string) => letter.toUpperCase());
  }

  static removeDuplicateSpaces(str: string): string {
    return str.replace(/ {2,}/g, ' ');
  }

  static removeDiacritic(str: string): string {
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  static removeSpecialCharacters(str: string): string {
    return str.replace(/[^a-zA-Z0-9 ]/g, '');
  }

  static splitNames(fullName: string): ReadonlyArray<string> {
    return fullName.trim().split(' ');
  }

  static firstName(fullName: string): string | null {
    return StringUtil.splitNames(fullName)[0] || null;
  }

  static lastName(fullName: string): string | null {
    const names: ReadonlyArray<string> = StringUtil.splitNames(fullName);
    return names[names.length - 1] || null;
  }

  static hideValue(info: string, index: number): string {
    if (!info) return '********';
    const visiblePart: string = info.slice(0, index);
    const hiddenPart: string = info.slice(index);
    return `${visiblePart}${'*'.repeat(hiddenPart.length)}`;
  }

  static isNameValid(name: string): boolean {
    return StringUtil.nameValidationRegex.test(name);
  }
}
