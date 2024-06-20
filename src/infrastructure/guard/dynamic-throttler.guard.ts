import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import {
  AppFeatures,
  FeatureFlagService,
  UluruRoutesThrottleFlag,
  UluruRoutesThrottlePathFlag,
} from '../../domain/_layer/infrastructure/service/feature-flag.service';
import { RateLimitReachedDomainError } from 'src/domain/_entity/result.error';

type Req = Record<string, unknown> & {
  readonly ips: ReadonlyArray<string>;
  readonly ip: string;
};

@Injectable()
export class DynamicThrottlerGuard extends ThrottlerGuard {
  constructor(
    @InjectThrottlerOptions() protected readonly throttlerModuleOptions: ThrottlerModuleOptions,
    @InjectThrottlerStorage() protected readonly throttlerStorage: ThrottlerStorage,
    protected readonly ref: Reflector,
    private readonly _featureFlagService: FeatureFlagService,
  ) {
    super(throttlerModuleOptions, throttlerStorage, ref);
  }

  override getTracker(req: Req): string {
    return req.ips.length > 0 ? req.ips[0] : req.ip;
  }

  override async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const currentPath: string = this.getCurrentPath(ctx);
    const currentOpts: UluruRoutesThrottlePathFlag = this.getOptions(currentPath);

    // Return early if the current route should be skipped.
    return currentOpts.skip ? true : this.handleRequest(ctx, currentOpts.limit, currentOpts.ttl);
  }

  protected override throwThrottlingException(_context: ExecutionContext): void {
    throw new RateLimitReachedDomainError();
  }

  getCurrentPath(ctx: ExecutionContext): string {
    return ctx.switchToHttp()?.getRequest()?.url || '';
  }

  getOptions(currentPath: string): UluruRoutesThrottlePathFlag {
    const flag: UluruRoutesThrottleFlag = this._featureFlagService.get(AppFeatures.uluruRoutesThrottle, {
      fallback: { limit: this.options.limit, ttl: this.options.ttl, skip: false },
      paths: [],
    });

    for (let idx: number = 0; idx < flag.paths.length; idx++) {
      const pathOptions: { readonly path: string } & UluruRoutesThrottlePathFlag = flag.paths[idx];
      if (this.isPathInFlag(currentPath, pathOptions.path)) return pathOptions;
    }

    return flag.fallback;
  }

  isPathInFlag(url: string, pattern: string): boolean {
    const validation: RegExpMatchArray | null = url.match(pattern);
    return Array.isArray(validation) && validation[0] === url;
  }
}
