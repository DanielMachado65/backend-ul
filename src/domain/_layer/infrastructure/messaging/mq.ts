export abstract class MQ {
  send: <TInput>(queue: string, message: TInput) => Promise<void>;
  buildQueueNameWithNodeEnv: (queueName: string) => string;
}
