import { TrackingDataLayerModule } from 'src/data/support/tracking/tracking-data-layer.module';
import { TrackingController } from './tracking.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [TrackingDataLayerModule],
  controllers: [TrackingController],
  providers: [],
})
export class TrackingPresentationLayerModule {}
