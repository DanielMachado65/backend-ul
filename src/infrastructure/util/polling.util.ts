import { PromiseFulfilled, PromiseRejected, PromiseUtil } from './promise.util';

type Nullable<Value> = Value | null;
type NullableFn<Value> = () => Promise<Value | null>;

type Args = ReadonlyArray<unknown>;
type TrampolineInput<Value> = (...args: Args) => Promise<Nullable<Value> | NullableFn<Value>>;
type TrampolineOutput<Value> = (...args: Args) => Promise<Nullable<Value>>;

type IsCancelled = () => boolean;
type PollingStepHelperRet<Value> = Promise<Nullable<Value> | NullableFn<Value>>;

export type Predicate<Value> = (value: Value, error: unknown) => boolean;
export type Executable<Value> = () => Value | Promise<Value>;

function trampoline<Value>(fn: TrampolineInput<Value>): TrampolineOutput<Value> {
  return async (...args: Args): Promise<Nullable<Value>> => {
    let result: Nullable<Value> | NullableFn<Value> = await fn(...args);

    while (result instanceof Function) result = await result();

    return result;
  };
}

async function pollingStepHelper<Value>(
  delayBetweenMs: number = 300,
  isCancelled: IsCancelled,
  predicate: Predicate<Value>,
  executable: Executable<Value>,
): PollingStepHelperRet<Value> {
  let result: Value | undefined;
  let error: unknown | undefined;

  try {
    result = await executable();
  } catch (err) {
    error = err;
  }

  if (isCancelled()) return null;

  if (predicate(result, error)) return result;

  await PromiseUtil.delay(delayBetweenMs);

  return (() =>
    pollingStepHelper<Value>(
      delayBetweenMs,
      isCancelled,
      predicate,
      executable,
    )) as unknown as PollingStepHelperRet<Value>;
}

export class PollingUtil {
  static async polling<Value>(
    initialDelayMs: number,
    timeoutMs: number,
    predicate: Predicate<Value>,
    executable: Executable<Value>,
    delayBetweenMs: number = 300,
  ): Promise<Value> {
    await PromiseUtil.delay(initialDelayMs);
    return PromiseUtil.timed(
      timeoutMs,
      (resolve: PromiseFulfilled<Value>, _reject: PromiseRejected, isCancelled: IsCancelled) => {
        const pollingStep: TrampolineOutput<Value> = trampoline(pollingStepHelper) as TrampolineOutput<Value>;
        const pollingPromise: Promise<Value> = pollingStep(delayBetweenMs, isCancelled, predicate, executable);
        pollingPromise.then((result: Value) => resolve(result));
      },
    );
  }
}
