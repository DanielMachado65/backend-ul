import { Module } from '@nestjs/common';
import { RewardsDataLayerModule } from 'src/data/support/rewards/rewards-data-layer.module';
import { RewardsController } from './rewards.controller';

@Module({
  imports: [RewardsDataLayerModule],
  controllers: [RewardsController],
  providers: [],
})
export class RewardsPresentationLayerModule {}
