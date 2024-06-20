import { Injectable } from '@nestjs/common';
import { TransactionHelper } from './transaction.helper';

@Injectable()
export class TransactionMockHelper implements TransactionHelper<null> {
  async withTransaction<Value>(callback: (transactionReference: null) => Promise<Value>): Promise<Value | null> {
    return callback(null);
  }
}
