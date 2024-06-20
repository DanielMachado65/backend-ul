import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';
import { TransactionHelper } from './transaction.helper';

@Injectable()
export class TransactionMongoHelper implements TransactionHelper<ClientSession> {
  constructor(@InjectConnection() private readonly _connection: Connection) {}

  async withTransaction<Value>(
    callback: (transactionReference: ClientSession) => Promise<Value>,
  ): Promise<Value | null> {
    let value: Value = null;
    const session: ClientSession = await this._connection.startSession();
    await session.withTransaction(async () => {
      // try/catch for debug purposes only
      try {
        value = await callback(session);
      } catch (error) {
        throw error;
      }
    });
    return value;
  }
}
