import { Module } from '@nestjs/common';
import { QueryDataLayerModule } from 'src/data/core/query/query-data-layer.module';
import { QueryJobEvent } from 'src/presentation/support/jobs/query-job.event';

@Module({
  imports: [QueryDataLayerModule],
  providers: [QueryJobEvent],
})
export class JobsPresentationModule {}
