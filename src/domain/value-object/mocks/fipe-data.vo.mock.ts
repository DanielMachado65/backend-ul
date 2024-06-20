import { FipeDataVo, FipePriceHistoryVo } from 'src/domain/value-object/fipe-data.vo';

export const mockFipeData = (params?: Partial<FipeDataVo>): FipeDataVo => {
  const fipeId: string = params.fipeId || Math.floor(Math.random() * 1000).toString();
  return {
    fipeId,
    brand: 'any_brand',
    model: 'any_model',
    modelBrand: 'any_model_brand',
    modelBrandCode: 2132312,
    modelYear: 2023,
    version: 'any_version',
  };
};

export const mockFipePriceHistoryVo = (params?: Partial<FipePriceHistoryVo>): FipePriceHistoryVo => {
  const fipeId: string = params.fipeId || Math.floor(Math.random() * 1000).toString();

  return {
    fipeId,
    brand: 'any_brand',
    fuel: 'any_fuel',
    history: [
      {
        month: 2,
        price: 30234,
        year: 2023,
      },
      {
        month: 1,
        price: 30452,
        year: 2023,
      },
      {
        month: 0,
        price: 30231,
        year: 2023,
      },
      {
        month: 11,
        price: 29988,
        year: 2022,
      },
      {
        month: 10,
        price: 29700,
        year: 2022,
      },
      {
        month: 9,
        price: 29976,
        year: 2022,
      },
    ],
    model: 'any_model',
    modelYear: 2019,
    version: 'any_version',
  };
};
