export enum AutomateEnum {
  QUERY_DATA = 'QUERY_DATA',
  REVIEW = 'REVIEW',
  USER_CREATED = 'USER_CREATED',
  PAYMENT = 'PAYMENT',
}

export type AutomateData = Record<string, unknown>;

export type AutomateFunction = (data: AutomateData) => Promise<void>;

export abstract class AutomateService {
  abstract dispatch(name: AutomateEnum, data: AutomateData): Promise<void>;
}
