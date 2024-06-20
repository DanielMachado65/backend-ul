import { DateOrNull, NumberOrNull, StringOrNull } from 'src/domain/types';

export type PartnerInformationsOptionals = {
  readonly description: string;
};

export class PartnerInformationsVo {
  plate?: StringOrNull;
  km?: StringOrNull;
  value?: NumberOrNull;
  date?: DateOrNull;
  notation?: StringOrNull;
  optionals?: ReadonlyArray<PartnerInformationsOptionals>;
  photos?: ReadonlyArray<string>;
}
