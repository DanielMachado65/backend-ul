import { DatasheetVo } from 'src/domain/value-object/datasheet.vo';

export const mockDatasheetVo = (): ReadonlyArray<DatasheetVo> => [
  {
    fipeId: 12345,
    modelYear: 2010,
    records: [
      {
        description: 'Desempenho',
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
        description: 'Geral',
        specs: [
          {
            property: 'property 5',
            value: 'value 5',
          },
          {
            property: 'property 6',
            value: 'value 6',
          },
        ],
      },
      {
        description: 'Consumo',
        specs: [
          {
            property: 'property 7',
            value: 'value 7',
          },
          {
            property: 'property 8',
            value: 'value 8',
          },
        ],
      },
      {
        description: 'Transmissão',
        specs: [
          {
            property: 'property 9',
            value: 'value 9',
          },
          {
            property: 'property 10',
            value: 'value 10',
          },
        ],
      },
      {
        description: 'Freios',
        specs: [
          {
            property: 'property 11',
            value: 'value 11',
          },
          {
            property: 'property 12',
            value: 'value 12',
          },
        ],
      },
      {
        description: 'Direção',
        specs: [
          {
            property: 'property 13',
            value: 'value 13',
          },
          {
            property: 'property 14',
            value: 'value 14',
          },
        ],
      },
    ],
  },
];
