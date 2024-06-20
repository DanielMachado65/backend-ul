import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JobOptions, JobQueue, QueryJob } from 'src/domain/_layer/infrastructure/job/query.job';

@Injectable()
export class BullAdapter implements QueryJob {
  constructor(@InjectQueue(JobQueue.QUERY) private readonly _queryQueue: Queue) {}

  async createJob<Input>(name: string, data: Input, options?: JobOptions): Promise<void> {
    await this._queryQueue.add(name, data, { ...options, jobId: name });
  }

  async removeJob(name: string): Promise<void> {
    await this._queryQueue.remove(name, { removeChildren: true });
  }
}
