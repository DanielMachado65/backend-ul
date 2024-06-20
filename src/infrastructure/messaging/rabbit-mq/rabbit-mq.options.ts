import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EnvService } from 'src/infrastructure/framework/env.service';

export type SetupRabbitMQOptions = (envService: EnvService) => MicroserviceOptions;

export const setupRabbitMQOptions = (envService: EnvService): MicroserviceOptions => {
  const url: string = envService.get<string>('RABBIT_MQ_URL');
  const nodeEnv: string = envService.get<string>('NODE_ENV');
  const queue: string = `${nodeEnv}_UluruQueryQueue`;

  return {
    transport: Transport.RMQ,
    options: {
      urls: [url],
      queue: queue,
      queueOptions: {
        durable: true,
      },
    },
  };
};
