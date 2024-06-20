import { Injectable } from '@nestjs/common';

export type PromiseFulfilled<ReturnValue> = (value: ReturnValue | PromiseLike<ReturnValue>) => undefined;
export type PromiseRejected = (reason?: unknown) => undefined;

export type PromiseExecutor<ReturnValue> = (
  resolve: PromiseFulfilled<ReturnValue>,
  reject: PromiseRejected,
  isCancelled: () => boolean,
) => void;
export type CancellablePromise<ReturnValue> = {
  // eslint-disable-next-line functional/prefer-readonly-type
  promise: Promise<ReturnValue>;

  // eslint-disable-next-line functional/prefer-readonly-type
  cancel: (error?: Error) => void;
};

class PromiseCancelledError extends Error {
  constructor(message: string = 'Promise cancelled before finish') {
    super(message);
    this.name = 'PromiseCancelledError';
  }
}

class PromiseTimeoutError extends Error {
  constructor(message: string = 'Promise timed out before finish') {
    super(message);
    this.name = 'PromiseTimeoutError';
  }
}

@Injectable()
export class PromiseUtil {
  static delay(timeoutMs: number): Promise<void> {
    return new Promise((resolve: PromiseFulfilled<void>) => {
      setTimeout(() => resolve(undefined), timeoutMs);
    });
  }

  static cancellable<Value>(executor: PromiseExecutor<Value>): CancellablePromise<Value> {
    const result: CancellablePromise<Value> = {
      promise: undefined,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      cancel: () => {},
    };

    result.promise = new Promise((resolve: PromiseFulfilled<Value>, reject: PromiseRejected) => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      let cancelled: boolean = false;
      const isCancelled: () => boolean = () => cancelled;

      result.cancel = (error: Error = new PromiseCancelledError()): void => {
        cancelled = true;
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        result.cancel = (): void => {};
        reject(error);
      };

      executor(resolve, reject, isCancelled);
    });

    return result;
  }

  static timed<Value>(timeoutMs: number, executor: PromiseExecutor<Value>): Promise<Value> {
    const { promise, cancel }: CancellablePromise<Value> = PromiseUtil.cancellable(executor);

    setTimeout(() => cancel(new PromiseTimeoutError()), timeoutMs);

    return promise;
  }

  async first<Result>(
    promises: ReadonlyArray<Promise<Result>>,
    shouldThrowOnNull: boolean = true,
  ): typeof shouldThrowOnNull extends false ? Promise<Result> : Promise<Result | null> {
    if (promises.length === 0) {
      if (shouldThrowOnNull) throw new Error('No promise set to be processed');
      else return null;
    }

    // eslint-disable-next-line prefer-const
    for (let promise of promises) {
      try {
        return await promise;
      } catch {
        continue;
      }
    }

    throw new Error('All promises were rejected');
  }
}
