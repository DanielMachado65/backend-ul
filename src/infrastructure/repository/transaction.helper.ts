export abstract class TransactionHelper<TransactionReference = unknown> {
  abstract withTransaction<Value>(
    callback: (transactionReference: TransactionReference) => Promise<Value>,
  ): Promise<Value | null>;
}
