import { QueryKeys } from 'src/domain/_entity/query.entity';
import { QueryDto } from '../_layer/data/dto/query.dto';

export type QuerySucceededEvent = {
  readonly queryId: string;
  readonly userId?: string;
  readonly keys?: QueryKeys;
  readonly queryDto?: QueryDto;
};
