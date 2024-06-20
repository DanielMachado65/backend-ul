export interface IBaseRepository<Dto, TransactionReference> {
  readonly getById: (id: string) => Promise<Dto | null>;
  readonly insert: (inputDto: Partial<Dto>, transactionReference?: TransactionReference) => Promise<Dto>;
  readonly insertMany: (
    inputs: ReadonlyArray<Partial<Dto>>,
    transactionReference?: TransactionReference,
  ) => Promise<ReadonlyArray<Dto>>;
  readonly removeById: (id: string, transactionReference?: TransactionReference) => Promise<Dto | null>;
  readonly updateById: (
    id: string,
    updateDto: Partial<Dto>,
    transactionReference?: TransactionReference,
  ) => Promise<Dto | null>;
  readonly count: () => Promise<number>;
}
