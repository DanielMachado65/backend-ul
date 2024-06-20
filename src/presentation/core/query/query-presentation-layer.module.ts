import { Module } from '@nestjs/common';
import { OwnerReviewDataLayerModule } from 'src/data/support/owner-review/owner-review-data-layer.module';
import { ResponseQueryController } from 'src/presentation/core/query/response-query.controller';
import { QueryDataLayerModule } from '../../../data/core/query/query-data-layer.module';
import { QueryController } from './query.controller';
import { TestDriveController } from './test-drive.controller';

@Module({
  imports: [QueryDataLayerModule, OwnerReviewDataLayerModule],
  controllers: [QueryController, TestDriveController, ResponseQueryController],
  providers: [],
})
export class QueryPresentationLayerModule {}
