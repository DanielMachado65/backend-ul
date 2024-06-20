export type QueryPartialSucceededEvent = {
  readonly userId: string;
  readonly queryCode: number;
  readonly queryId: string;
  readonly failedServices: ReadonlyArray<number>;
  readonly queryKeys: object;
  readonly version: number;
};
