import { StringUtil } from './string.util';

type GreetProvidedInformation = {
  readonly sex: 'male' | 'female' | 'undefined';
};

type GreetInternalInformation = {
  readonly currentTime: Date;
};

type GreetInformation = GreetInternalInformation & GreetProvidedInformation;

type GreetContext = {
  readonly text: string;
  readonly condition: null | ((arg0: GreetInformation) => boolean);
};

type DayState = 'morning' | 'afternoon' | 'evening' | 'night' | 'unknown';

export abstract class GreetingUtil {
  abstract greet(name: string, info: Partial<GreetProvidedInformation>): string;
  abstract generateGreet(info: Partial<GreetInformation>): string;
}

export class BrazilianGreetingUtil extends GreetingUtil {
  static greets: ReadonlyArray<GreetContext> = [
    {
      text: 'olá',
      condition: null,
    },
    {
      text: 'oi',
      condition: null,
    },
    {
      text: 'bom dia',
      condition: (info: GreetInformation): boolean => {
        const state: DayState = BrazilianGreetingUtil._getDayState(info.currentTime);
        return state === 'morning';
      },
    },
    {
      text: 'boa tarde',
      condition: (info: GreetInformation): boolean => {
        const state: DayState = BrazilianGreetingUtil._getDayState(info.currentTime);
        return state === 'afternoon';
      },
    },
    {
      text: 'boa noite',
      condition: (info: GreetInformation): boolean => {
        const state: DayState = BrazilianGreetingUtil._getDayState(info.currentTime);
        return state === 'evening' || state === 'night';
      },
    },
    {
      text: 'opa',
      condition: null,
    },
  ];

  static defaultGreetProvidedInformation: GreetProvidedInformation = {
    sex: 'undefined',
  };

  greet(name: string, info: Partial<GreetProvidedInformation>): string {
    const internal: GreetInternalInformation = this._getInternalInformation();
    const greet: string = this.generateGreet({ ...internal, ...info });
    return greet ? StringUtil.capitalizeFirstLetter(greet) + ' ' + name : name;
  }

  generateGreet(info: GreetInternalInformation & Partial<GreetProvidedInformation>): string {
    const infoFull: GreetInformation = { ...BrazilianGreetingUtil.defaultGreetProvidedInformation, ...info };
    const availableGreets: ReadonlyArray<string> = BrazilianGreetingUtil.greets
      .filter((greeting: GreetContext) => !greeting.condition || greeting.condition(infoFull))
      .map((greeting: GreetContext) => greeting.text);

    return availableGreets[Math.floor(Math.random() * availableGreets.length)];
  }

  private static _getDayState(now: Date): DayState {
    if (now.getHours() > 5 && now.getHours() <= 12) {
      return 'morning';
    } else if (now.getHours() > 12 && now.getHours() <= 18) {
      return 'afternoon';
    } else if (now.getHours() > 18 && now.getHours() <= 22) {
      return 'evening';
    } else if (now.getHours() > 22 || now.getHours() <= 5) {
      return 'night';
    } else {
      return 'unknown';
    }
  }

  private _getInternalInformation(): GreetInternalInformation {
    return {
      currentTime: new Date(),
    };
  }
}
