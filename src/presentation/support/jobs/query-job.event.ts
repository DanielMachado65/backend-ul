import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobQueue } from 'src/domain/_layer/infrastructure/job/query.job';
import { SendEmailOnQueryFinishDomain } from 'src/domain/core/query/v2/send-email-on-query-finish.domain';

@Processor(JobQueue.QUERY)
export class QueryJobEvent extends WorkerHost {
  constructor(private readonly _sendEmailOnQueryFinishDomain: SendEmailOnQueryFinishDomain) {
    super();
  }

  async process({ data }: Job): Promise<void> {
    this._sendEmailOnQueryFinishDomain.send(data.queryId).safeRun();
  }
}
