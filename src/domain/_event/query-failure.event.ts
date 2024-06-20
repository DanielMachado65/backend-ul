import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';

export type QueryFailureEvent = {
  readonly queryDto?: QueryDto;
};
