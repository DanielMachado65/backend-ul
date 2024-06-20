export const MESSAGE_SERVICE: string = 'MESSAGE_SERVICE';

export abstract class BrokerProducer {
  send: <TInput>(topic: string, data: TInput) => Promise<void>;
  publish: <TInput>(topic: string, data: TInput) => Promise<void>;
}
