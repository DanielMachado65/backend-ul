import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailDataLayerModule } from 'src/data/support/email/email-data-layer.module';

@Module({
  imports: [EmailDataLayerModule],
  controllers: [EmailController],
  providers: [],
})
export class EmailPresentationLayerModule {}
