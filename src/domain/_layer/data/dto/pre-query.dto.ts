import { PreQueryEntity } from 'src/domain/_entity/pre-query.entity';

export type PreQueryDto = PreQueryEntity & {
  brandImageUrl: string;
};
