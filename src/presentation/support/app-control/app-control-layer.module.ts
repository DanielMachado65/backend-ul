import { Module } from '@nestjs/common';

import { AppControlLayerModule } from 'src/data/support/app-control/app-control-layer.module';
import { AppControlContoller } from './app-control.controller';

@Module({
  imports: [AppControlLayerModule],
  controllers: [AppControlContoller],
})
export class AppControlModule {}
