import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { RastruModule, SpanItem, Trace } from '@alissonfpmorais/rastru';
import { DynamicModule } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable, catchError, tap } from 'rxjs';
import {
  EVENT_EMITTER_SERVICE,
  EventEmitterService,
} from 'src/domain/_layer/infrastructure/service/event/event.service';
import {
  AppFeatures,
  FeatureFlagService,
  UluruTraceRule,
  UluruTraceRulePolicy,
  UluruTraceRules,
} from 'src/domain/_layer/infrastructure/service/feature-flag.service';
import { SanitizeUtil } from 'src/infrastructure/util/sanitize.util';

export const rastruModule: DynamicModule = RastruModule.forRootAsync({
  inject: [FeatureFlagService, ClsService, EVENT_EMITTER_SERVICE],
  useFactory: async (
    featFlagService: FeatureFlagService,
    clsService: ClsService,
    eventEmitterService: EventEmitterService,
  ) => {
    return {
      isTraceEnabled: (traceName: string): boolean => {
        const traceRules: UluruTraceRules = featFlagService.get(AppFeatures.uluruTraceRules, {});
        const policy: UluruTraceRule | undefined = traceRules && traceRules[traceName];
        return Boolean(policy?.enable);
      },
      appendSpanToTrace: (traceName: string, span: SpanItem): Trace => {
        const trace: Trace = clsService.get(traceName);
        trace.spans = [...trace.spans, span];
        clsService.set(traceName, trace);

        return trace;
      },
      getOrCreateTrace: (traceName: string): Trace => {
        const trace: Trace | undefined = clsService.get(traceName);
        if (!trace) clsService.set(traceName, { traceId: clsService.getId(), traceName, spans: [] });
        return trace;
      },
      setTrace: (traceName: string, trace: Trace): Trace => {
        clsService.set(traceName, trace);
        return trace;
      },
      sanitizeDeepCloningEnabled: false,
      sanitizeInput: (traceName: string, targetName: string, input: Array<unknown>): Array<unknown> => {
        const traceRules: UluruTraceRules = featFlagService.get(AppFeatures.uluruTraceRules, {});
        const rule: UluruTraceRule | undefined = traceRules && traceRules[traceName];
        let inputPolicy: ReadonlyArray<unknown>;

        if (rule) {
          const rulePolicy: UluruTraceRulePolicy | boolean | undefined = rule[targetName];

          if (typeof rulePolicy === 'boolean') {
            inputPolicy = [...new Array(input.length)].map(() => rulePolicy);
          } else if (typeof rulePolicy === 'object' && rulePolicy) {
            const rulePolicyInput: unknown = rulePolicy.input;

            if (typeof rulePolicyInput === 'boolean')
              inputPolicy = [...new Array(input.length)].map(() => rulePolicyInput);
            else if (Array.isArray(rulePolicyInput) && input.length <= rulePolicyInput.length)
              inputPolicy = rulePolicyInput;
            else if (Array.isArray(rulePolicyInput))
              inputPolicy = [
                ...rulePolicyInput,
                ...[...new Array(input.length - rulePolicyInput.length)].map(() => false),
              ];
            else inputPolicy = [...new Array(input.length)].map(() => false);
          } else {
            inputPolicy = [...new Array(input.length)].map(() => false);
          }
        } else {
          inputPolicy = [...new Array(input.length)].map(() => false);
        }

        return input.map((param: unknown, index: number) => SanitizeUtil.applyPolicy(param, inputPolicy[index]));
      },
      sanitizeOutput: (traceName: string, targetName: string, output: unknown): unknown => {
        const traceRules: UluruTraceRules = featFlagService.get(AppFeatures.uluruTraceRules, {});
        const rule: UluruTraceRule | undefined = traceRules && traceRules[traceName];
        let outputPolicy: unknown;

        if (rule) {
          const rulePolicy: UluruTraceRulePolicy | boolean | undefined = rule[targetName];

          if (typeof rulePolicy === 'boolean') {
            outputPolicy = rulePolicy;
          } else if (typeof rulePolicy === 'object' && rulePolicy) {
            const rulePolicyOutput: unknown = rulePolicy.output;

            if (typeof rulePolicyOutput === 'boolean') outputPolicy = rulePolicyOutput;
            else if (typeof rulePolicyOutput === 'object' && rulePolicyOutput) outputPolicy = rulePolicyOutput;
            else outputPolicy = false;
          } else {
            outputPolicy = false;
          }
        } else {
          outputPolicy = false;
        }

        return SanitizeUtil.applyPolicy(output, outputPolicy);
      },
      dispatchTrace: (traceName: string): void => {
        const trace: Trace = clsService.get(traceName);
        eventEmitterService.dispatchTraceCollected({ trace });
      },
      responseHandlers: [
        {
          instanceType: EitherIO,
          instanceHandler: (
            instaceType: EitherIO<unknown, unknown>,
            resolve: (output: unknown) => void,
            reject: (error: unknown) => void,
          ): EitherIO<unknown, unknown> => {
            return instaceType
              .tap((response: unknown) => {
                resolve(response);
              })
              .catch((error: unknown) => {
                reject(error);
                return Either.left(error);
              });
          },
        },
        {
          instanceType: Observable,
          instanceHandler: (
            instaceType: Observable<unknown>,
            resolve: (output: unknown) => void,
            reject: (error: unknown) => void,
          ): Observable<unknown> => {
            return instaceType.pipe(
              tap((output: unknown) => {
                resolve(output);
              }),
              catchError((error: unknown, caught: Observable<unknown>) => {
                reject(error);
                return caught;
              }),
            );
          },
        },
      ],
    };
  },
});
