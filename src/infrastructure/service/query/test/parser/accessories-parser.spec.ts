import { AccessoryVo } from 'src/domain/value-object/accessory.vo';
import { BasicVehicleDataCollection } from 'src/domain/value-object/basic-vechicle.vo';
import { QueryAccessoryVo } from 'src/domain/value-object/query/query-accessory.vo';
import { AccessoriesParser } from 'src/infrastructure/service/query/parser/accessories-parser';

describe(AccessoriesParser.name, () => {
  test('should return an empty array if accessories or dataCollection are not an array', () => {
    const result: QueryAccessoryVo = AccessoriesParser.parse(null, null);

    expect(result).toStrictEqual({ veiculosFipe: [] });
  });
  test('should parser data to QueryAccessoryVo', () => {
    const fipeId1: number = 12345;
    const fipeId2: number = 34567;

    const fipeDataCollection: ReadonlyArray<BasicVehicleDataCollection> = [
      {
        fipeId: fipeId1?.toString(),
        versionId: 21345,
      },
      {
        fipeId: fipeId2?.toString(),
        versionId: 567895,
      },
    ];

    const accessories: ReadonlyArray<AccessoryVo> = [
      {
        fipeId: fipeId1,
        records: [
          {
            description: 'description_1',
            isSeries: true,
          },
        ],
      },
      {
        fipeId: fipeId2,
        records: [
          {
            description: 'description_2',
            isSeries: false,
          },
        ],
      },
    ];

    const result: QueryAccessoryVo = AccessoriesParser.parse(accessories, fipeDataCollection);

    expect(result).toStrictEqual({
      veiculosFipe: [
        {
          fipeId: fipeId1.toString(),
          idVersao: fipeDataCollection[0].versionId.toString(),
          registros: [
            {
              descricao: 'description_1',
              itemDeSerie: true,
            },
          ],
        },
        {
          fipeId: fipeId2.toString(),
          idVersao: fipeDataCollection[1].versionId.toString(),
          registros: [
            {
              descricao: 'description_2',
              itemDeSerie: false,
            },
          ],
        },
      ],
    });
  });
});
