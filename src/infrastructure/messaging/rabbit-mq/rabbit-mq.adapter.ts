import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Channel, connect, Connection } from 'amqplib';

import { MQ } from 'src/domain/_layer/infrastructure/messaging/mq';
import { EnvService } from 'src/infrastructure/framework/env.service';

@Injectable()
export class RabbitMQAdapter implements MQ, OnModuleInit, OnModuleDestroy {
  private _connection: Connection;
  // eslint-disable-next-line functional/prefer-readonly-type
  private _channels: Map<string, Channel>;

  constructor(private readonly _envService: EnvService) {
    this._connection = null;
    this._channels = new Map();
  }

  async onModuleInit(): Promise<void> {
    await this._openConnection();
  }

  async onModuleDestroy(): Promise<void> {
    await this._closeConnection();
  }

  private async _openConnection(): Promise<void> {
    await this._closeConnection();

    try {
      const url: string = this._envService.get('RABBIT_MQ_URL');
      const onClose: () => void = () => {
        this._channels = new Map();
        this._connection = null;
      };

      this._connection = await connect(url, { heartbeat: 60 });
      this._connection.on('close', onClose);
      this._connection.on('error', onClose);
    } catch (error) {
      console.log(`Failed to open RabbitMQ's connection`);
      console.log(error);
    }
  }

  private async _closeConnection(): Promise<void> {
    try {
      if (!this._connection) return;

      await this._closeChannels();
      await this._connection.close();
      this._connection = null;
    } catch (error) {
      console.log(`Failed to close RabbitMQ's connection`);
      console.log(error);
    }
  }

  private async _closeChannels(): Promise<void> {
    const queueNames: IterableIterator<string> = this._channels.keys();

    for (const queueName of queueNames) {
      await this._closeChannel(queueName);
    }
  }

  private async _closeChannel(queueName: string): Promise<void> {
    try {
      const channel: Channel = this._getChannel(queueName);

      if (!channel) return;

      await channel.close();
      this._channels.delete(queueName);
    } catch (error) {
      console.log(`Failed to close RabbitMQ's channel`);
      console.log(error);
    }
  }

  private _getChannel(queueName: string): Channel | null {
    const channel: Channel = this._channels.get(queueName);
    return channel || null;
  }

  private async _createChannel(queueName: string): Promise<void> {
    try {
      if (!this._connection) await this._openConnection();
      if (this._getChannel(queueName)) return;
      const channel: Channel = await this._connection.createChannel();
      await channel.assertQueue(queueName);
      this._channels.set(queueName, channel);
    } catch (error) {
      console.log(`Failed to create RabbitMQ's ${queueName} channel`);
      console.log(error);
    }
  }

  async send<Message>(queueName: string, message: Message, pattern?: string): Promise<void> {
    await this._createChannel(queueName);
    const channel: Channel = this._getChannel(queueName);

    if (!channel) return;

    const jsonStringify: string = !!pattern
      ? JSON.stringify({ pattern: pattern, data: message })
      : JSON.stringify(message);

    channel.sendToQueue(queueName, Buffer.from(jsonStringify));
  }

  buildQueueNameWithNodeEnv(queueName: string): string {
    const nodeEnv: string = this._envService.get('NODE_ENV');
    return `${nodeEnv}_${queueName}`;
  }
}
