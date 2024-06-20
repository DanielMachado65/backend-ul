import { Module } from '@nestjs/common';
import { OwnerReviewDataLayerModule } from '../../../data/support/owner-review/owner-review-data-layer.module';
import { OwnerReviewController } from './owner-review.controller';

@Module({
  imports: [OwnerReviewDataLayerModule],
  controllers: [OwnerReviewController],
  providers: [],
})
export class OwnerReviewPresentationLayerModule {}
