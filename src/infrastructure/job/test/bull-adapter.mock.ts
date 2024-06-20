import { Injectable } from '@nestjs/common';
import { JobOptions, QueryJob } from 'src/domain/_layer/infrastructure/job/query.job';

@Injectable()
export class BullAdapterMock implements QueryJob {
  async createJob<Input>(_name: string, _data: Input, _options?: JobOptions): Promise<void> {
    return Promise.resolve();
  }

  async removeJob(_name: string): Promise<void> {
    return Promise.resolve();
  }
}
