import { AccessoryVo } from 'src/domain/value-object/accessory.vo';
import { BasicPackVo } from 'src/domain/value-object/basic-pack.vo';
import { BasicVehicleVo, VehicleNationality } from 'src/domain/value-object/basic-vechicle.vo';
import { DatasheetVo } from 'src/domain/value-object/datasheet.vo';
import { RevisionVo } from 'src/domain/value-object/revision.vo';

export const mockAccessoryVo = (): ReadonlyArray<AccessoryVo> => [
  {
    fipeId: 12345,
    records: [
      {
        description: 'description 1',
        isSeries: true,
      },
      {
        description: 'description 2',
        isSeries: false,
      },
    ],
    acessoryCategories: [],
  },
];

export const mockBasicPackVo = (): ReadonlyArray<BasicPackVo> => [
  {
    fipeId: 12345,
    modelYear: 2015,
    records: [
      {
        aftermarketMakerDescription: 'aftermarket_maker_description 1',
        complement: 'complement 1',
        isGenuine: true,
        nicknameDescription: 'nickname_description 1',
        nicknameId: 11,
        partNumber: 'part_number 1',
        value: 123,
      },
      {
        aftermarketMakerDescription: 'aftermarket_maker_description 2',
        complement: 'complement 2',
        isGenuine: false,
        nicknameDescription: 'nickname_description 2',
        nicknameId: 1321,
        partNumber: 'part_number 2',
        value: 321321,
      },
    ],
  },
];

export const mockBasicVehicleVo = (): BasicVehicleVo => ({
  fipeData: [
    {
      brand: 'brand',
      currentPrice: 3213122311,
      fipeId: 213,
      fuel: 'fuel',
      model: 'model',
      version: 'version',
      modelYear: 2022,
      priceHistory: [{ month: 12, price: 123123, year: 2022 }],
    },
  ],
  dataCollection: [{ fipeId: '231', versionId: 21321 }],
  brand: 'brand',
  fipeId: 123,
  model: 'model',
  version: 'version',
  plate: 'plate',
  modelYear: 2022,
  manufactureYear: 2021,
  fuel: 'fuel',
  chassis: 'chassis',
  type: 'type',
  species: 'species',
  isNational: true,
  enginePower: 12312,
  nationality: VehicleNationality.NATIONAL,
  axisCount: 123,
  pbt: 34423324,
  cmt: 432243,
  cc: 432432,
  currentPrice: 423342234,
  seatCount: 5,
  loadCapacity: 5,
  gearBoxNumber: 'gear_box_number',
  backAxisCount: 'back_axis_count',
  auxAxisCount: 'aux_axis_count',
  engineNumber: 'engine_number',
  bodyNumber: 'body_number',
});

export const mockRevisonVo = (): ReadonlyArray<RevisionVo> => [
  {
    fipeId: 12345,
    versionId: 11111,
    year: 2020,
    records: [
      {
        kilometers: 100232,
        months: 9,
        parcels: 19,
        durationMinutes: 100,
        fullPrice: 1031323,
        parcelPrice: 10333,
        changedParts: [
          {
            amount: 321,
            description: 'description 1',
          },
        ],
        inspections: ['aaaa', 'bbbb'],
      },
      {
        kilometers: 32311,
        months: 3,
        parcels: 1,
        durationMinutes: 32,
        fullPrice: 3545,
        parcelPrice: 4343,
        changedParts: [
          {
            amount: 3,
            description: 'description 2',
          },
        ],
        inspections: ['cccc', 'dddd'],
      },
    ],
  },
];

export const mockDataSheetVo = (): ReadonlyArray<DatasheetVo> => [
  {
    fipeId: 12345,
    modelYear: 2015,
    records: [
      {
        description: 'description 1',
        specs: [
          {
            property: 'property 1',
            value: 'value 1',
          },
          {
            property: 'property 2',
            value: 'value 2',
          },
        ],
      },
      {
        description: 'description 2',
        specs: [
          {
            property: 'property 3',
            value: 'value 3',
          },
          {
            property: 'property 4',
            value: 'value 4',
          },
        ],
      },
    ],
  },
];
