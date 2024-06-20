export type TransactionCreditsCreatedEvent = {
  readonly userId: string;
  readonly valueInCents: number;
  readonly assignerId?: string;
};
