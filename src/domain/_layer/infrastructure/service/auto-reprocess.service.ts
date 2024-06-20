import { GetAutoReprocessQueryDto } from 'src/domain/_layer/data/dto/get-auto-reprocess-query.dto';

export type ReprocessQueryInput = {
  readonly queryCode: number;
  readonly queryId: string;
  readonly failedServices: ReadonlyArray<number>;
  readonly queryKeys: object;
  readonly version: number;
};

export abstract class AutoReprocessQueryService {
  requestToReprocess: (input: ReprocessQueryInput) => Promise<void>;
  getByQueryId: (queryId: string) => Promise<GetAutoReprocessQueryDto>;
  cancelReprocess: (queryId: string) => Promise<void>;
}
