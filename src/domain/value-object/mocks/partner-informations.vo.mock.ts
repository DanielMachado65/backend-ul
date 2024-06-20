import { PartnerInformationsVo } from 'src/domain/value-object/partner-informations.vo';

export const mockPartnerInformationsVo = (): PartnerInformationsVo => ({
  plate: 'any_plate',
  date: new Date(),
  km: '122',
  value: 123122,
  notation: 'any_notation',
  optionals: [{ description: 'any_description1' }],
  photos: ['photo1', 'photo2'],
});
