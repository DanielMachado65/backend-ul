import { NumberOrNull, StringOrNull } from 'src/domain/types';

export type BasicPackRecord = {
  readonly nicknameId?: NumberOrNull;
  readonly nicknameDescription?: StringOrNull;
  readonly complement?: StringOrNull;
  readonly partNumber?: StringOrNull;
  readonly isGenuine?: boolean;
  readonly value?: NumberOrNull;
  readonly aftermarketMakerDescription?: StringOrNull;
};

export type BasicPackVo = {
  readonly fipeId: number;
  readonly modelYear: number;
  readonly records: ReadonlyArray<BasicPackRecord>;
};
