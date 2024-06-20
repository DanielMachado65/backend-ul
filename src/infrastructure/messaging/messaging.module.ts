import { Module, Provider } from '@nestjs/common';

import { MQ } from 'src/domain/_layer/infrastructure/messaging/mq';
import { RabbitMQAdapter } from './rabbit-mq/rabbit-mq.adapter';

const providers: ReadonlyArray<Provider> = [
  {
    provide: MQ,
    useClass: RabbitMQAdapter,
  },
];

@Module({
  imports: [],
  providers: [...providers],
  exports: [...providers],
})
export class MessagingModule {}
