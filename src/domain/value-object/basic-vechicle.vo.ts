import { NumberOrNull, StringOrNull } from 'src/domain/types';

export enum VehicleNationality {
  UNKNOWN = 'Desconhecido',
  IMPORTED = 'Importado',
  NATIONAL = 'Nacional',
}

export type BasicVehicleFipePriceHistory = {
  readonly month: number;
  readonly year: number;
  readonly price: number;
};

export type BasicVehicleFipeVo = {
  readonly brand: StringOrNull;
  readonly currentPrice: NumberOrNull;
  readonly fipeId: NumberOrNull;
  readonly fuel: StringOrNull;
  readonly model: StringOrNull;
  readonly version: StringOrNull;
  readonly modelYear: NumberOrNull;
  readonly priceHistory: ReadonlyArray<BasicVehicleFipePriceHistory>;
};

export type BasicVehicleDataCollection = {
  readonly fipeId: StringOrNull;
  readonly versionId: NumberOrNull;
};

export type BasicVehicleVo = {
  readonly fipeData: ReadonlyArray<BasicVehicleFipeVo>;
  readonly dataCollection: ReadonlyArray<BasicVehicleDataCollection>;
  readonly brand: StringOrNull;
  readonly fipeId: NumberOrNull;
  readonly model: StringOrNull;
  readonly version: StringOrNull;
  readonly plate: StringOrNull;
  readonly modelYear: NumberOrNull;
  readonly manufactureYear: NumberOrNull;
  readonly fuel: StringOrNull;
  readonly chassis: StringOrNull;
  readonly type: StringOrNull;
  readonly species: StringOrNull;
  readonly isNational: boolean;
  readonly enginePower: NumberOrNull;
  readonly nationality: VehicleNationality;
  readonly axisCount: NumberOrNull;
  readonly pbt: NumberOrNull;
  readonly cmt: NumberOrNull;
  readonly cc: NumberOrNull;
  readonly currentPrice: NumberOrNull;
  readonly seatCount: NumberOrNull;
  readonly loadCapacity: NumberOrNull;
  readonly gearBoxNumber: StringOrNull;
  readonly backAxisCount: StringOrNull;
  readonly auxAxisCount: StringOrNull;
  readonly engineNumber: StringOrNull;
  readonly bodyNumber: StringOrNull;
};
