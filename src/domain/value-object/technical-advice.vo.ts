import { StringOrNull } from 'src/domain/types';

export type TechnicalAdviceVo = {
  readonly imageLink: StringOrNull;
  readonly technicalAdvice: StringOrNull;
  readonly trafficLight: StringOrNull;
};
