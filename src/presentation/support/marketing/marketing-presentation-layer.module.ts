import { Module } from '@nestjs/common';
import { MarketingController } from './marketing.controller';
import { MarketingDataLayerModule } from '../../../data/support/marketing/marketing-data-layer.module';

@Module({
  imports: [MarketingDataLayerModule],
  controllers: [MarketingController],
  providers: [],
})
export class MarketingPresentationLayerModule {}
