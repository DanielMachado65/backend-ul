import { Injectable } from '@nestjs/common';

export type TransitionPointer<Before, Next> = {
  readonly value: Before;
  readonly allow: ReadonlyArray<Next>;
  readonly negate?: boolean;
};

export type TransitionRule<
  Before extends PrimitiveForTransition,
  Next extends PrimitiveForTransition = Before,
> = ReadonlyArray<TransitionPointer<Before, Next>>;

type PrimitiveForTransition = string | number;

export interface ITransitionOptions {
  readonly shouldAllowSelfTransitions: boolean;
}

@Injectable()
export class TransitionUtil {
  private _defaultOptions: ITransitionOptions = {
    shouldAllowSelfTransitions: true,
  };

  validateTransition<Type extends PrimitiveForTransition>(
    before: Type,
    next: Type,
    transitionRule: TransitionRule<Type, Type>,
    receivedOptions: Partial<ITransitionOptions> = {},
  ): boolean {
    const { shouldAllowSelfTransitions }: ITransitionOptions = {
      ...this._defaultOptions,
      ...receivedOptions,
    };

    const transitionPointer: TransitionPointer<Type, Type> | undefined = transitionRule.find(
      (transitionPointer: TransitionPointer<Type, Type>) => transitionPointer.value === before,
    );

    if (!transitionPointer) {
      const isSelf: boolean = next === before;

      return isSelf ? shouldAllowSelfTransitions : false;
    } else {
      const isSelf: boolean = next === before;
      const isInAllow: boolean = transitionPointer.allow.some((allow: Type) => allow === next);
      const shouldNegative: boolean = transitionPointer.negate ? transitionPointer.negate : false;

      const isIn: boolean = shouldAllowSelfTransitions ? isInAllow || isSelf : isInAllow;

      return shouldNegative ? !isIn : isIn;
    }
  }
}
