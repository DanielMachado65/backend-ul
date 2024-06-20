export enum JobQueue {
  QUERY = 'query',
}

export type JobOptions = {
  readonly delay?: number;
  readonly removeOnComplete?: boolean;
};

export abstract class QueryJob {
  createJob: <Input>(name: string, data: Input, options?: JobOptions) => Promise<void>;
  removeJob: (name: string) => Promise<void>;
}
