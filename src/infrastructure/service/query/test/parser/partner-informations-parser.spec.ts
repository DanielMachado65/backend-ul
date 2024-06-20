import { PartnerInformationsVo } from 'src/domain/value-object/partner-informations.vo';
import { QueryAd } from 'src/domain/value-object/query/query-partner-informations.vo';
import { PartnerInformationsParser } from 'src/infrastructure/service/query/parser/partner-informations-parser';

const mockPartnerInformations = (): PartnerInformationsVo => ({
  date: new Date(),
  km: '11000',
  notation: 'any_notation',
  optionals: [
    {
      description: 'any_description 1',
    },
    {
      description: 'any_description 2',
    },
  ],
  photos: ['photo 1', 'photo 2', 'photo 3'],
  plate: 'any_plate',
  value: 13213,
});

describe(PartnerInformationsParser.name, () => {
  test('should return null if input is null or undefined', () => {
    const result: QueryAd = PartnerInformationsParser.parseQueryAd(null);
    expect(result).toBe(null);

    const result2: QueryAd = PartnerInformationsParser.parseQueryAd(undefined);
    expect(result2).toBe(null);
  });

  test('should parse input to QueryAd', () => {
    const partnerInformations: PartnerInformationsVo = mockPartnerInformations();

    const result: QueryAd = PartnerInformationsParser.parseQueryAd(partnerInformations);

    expect(result).toStrictEqual({
      data: partnerInformations.date.toLocaleString(),
      km: '11000',
      observacao: 'any_notation',
      placa: 'any_plate',
      valor: 13213,
      opcionais: [
        {
          descricao: 'any_description 1',
        },
        {
          descricao: 'any_description 2',
        },
      ],
      fotosRaw: ['photo 1', 'photo 2', 'photo 3'],
      fotos: [{ url: 'photo 1' }, { url: 'photo 2' }, { url: 'photo 3' }],
    });
  });

  test('should parse input to QueryAd with photos and optionals null', () => {
    const partnerInformations: PartnerInformationsVo = { ...mockPartnerInformations(), optionals: null, photos: null };

    const result: QueryAd = PartnerInformationsParser.parseQueryAd(partnerInformations);

    expect(result).toStrictEqual({
      data: partnerInformations.date.toLocaleString(),
      km: '11000',
      observacao: 'any_notation',
      placa: 'any_plate',
      valor: 13213,
      opcionais: undefined,
      fotosRaw: null,
      fotos: undefined,
    });
  });
  test('should parse input to QueryAd with all fields null', () => {
    const partnerInformations: PartnerInformationsVo = {
      date: null,
      km: null,
      notation: null,
      plate: null,
      value: null,
      optionals: null,
      photos: null,
    };

    const result: QueryAd = PartnerInformationsParser.parseQueryAd(partnerInformations);

    expect(result).toStrictEqual({
      data: undefined,
      km: null,
      observacao: null,
      placa: null,
      valor: null,
      opcionais: undefined,
      fotosRaw: null,
      fotos: undefined,
    });
  });
});
