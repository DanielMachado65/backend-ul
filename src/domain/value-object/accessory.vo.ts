import { StringOrNull } from 'src/domain/types';

export type AccessoryCategory = {
  readonly id: string;
  readonly description: string;
};

export type AccessoryVo = {
  readonly fipeId: number;
  readonly records: ReadonlyArray<AccessoryRecord>;
  readonly acessoryCategories: ReadonlyArray<AccessoryCategory>;
};

export type AccessoryRecord = {
  readonly description?: StringOrNull;
  readonly isSeries?: boolean;
  readonly categoryId?: string | null;
};
