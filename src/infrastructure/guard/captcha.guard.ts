import { CanActivate, ExecutionContext, Inject, Injectable, SetMetadata, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaptchaService } from '../../domain/_layer/infrastructure/service/captcha.service';
import { CaptchaKind, ICaptchaGuard } from '../../domain/_layer/infrastructure/captcha/captcha.guard';
import { GoogleRecaptchaV2Guard } from './captcha/google-recaptcha-v2.guard';
import {
  cleanUpDomainError,
  DomainError,
  InvalidCaptchaDomainError,
  isDomainError,
  SentryDomainError,
} from '../../domain/_entity/result.error';
import { CaptchaMultiServices, MultiServices } from '../../domain/_layer/infrastructure/multi-service';
import { DeviceInfoData, DeviceKind } from '../../domain/_layer/infrastructure/middleware/device-info.middleware';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

const metadataKey: string = 'captcha_kinds';

type CaptchaGuardFactory = <CaptchaDto>(captchaService: CaptchaService<CaptchaDto>) => ICaptchaGuard;

export type CaptchaKinds = ReadonlyArray<CaptchaKind>;

export type CaptchaOpts = {
  readonly captchaKinds: {
    readonly [DeviceKind.COMPUTER]: CaptchaKinds;
    readonly [DeviceKind.MOBILE]: CaptchaKinds;
    readonly [DeviceKind.UNKNOWN]: CaptchaKinds;
  };
};

const toCaptchaOpts = (kinds: CaptchaKinds): CaptchaOpts => ({
  captchaKinds: {
    [DeviceKind.COMPUTER]: kinds,
    [DeviceKind.MOBILE]: kinds,
    [DeviceKind.UNKNOWN]: kinds,
  },
});

const toCaptchaKinds = (kind: CaptchaKind): CaptchaKinds => [kind];

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Captcha: (captchaKinds: CaptchaKind | CaptchaKinds | CaptchaOpts) => MethodDecorator & ClassDecorator = (
  captchaKinds: CaptchaKind,
) => {
  const kinds: CaptchaOpts =
    typeof captchaKinds === 'string'
      ? toCaptchaOpts(toCaptchaKinds(captchaKinds))
      : Array.isArray(captchaKinds)
      ? toCaptchaOpts(captchaKinds)
      : captchaKinds;

  return <PropType>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Function | Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<PropType>,
    // eslint-disable-next-line functional/no-return-void
  ): void => {
    SetMetadata(metadataKey, kinds)(target, propertyKey, descriptor);
    UseGuards(CaptchaGuard)(target, propertyKey, descriptor);
  };
};

@Injectable()
class CaptchaGuard implements CanActivate {
  private readonly _guards: ReadonlyMap<CaptchaKind, ICaptchaGuard>;

  constructor(
    private readonly _reflector: Reflector,
    @Inject(MultiServices.CAPTCHA) private readonly _captchaServices: CaptchaMultiServices,
    @InjectSentry() private readonly _client: SentryService,
  ) {
    // Pre-setup Guard with all required dependencies (except `CaptchaService`)
    // The factory here is for dynamic building (correlating each guard with it's specific service)
    const preGuards: ReadonlyMap<CaptchaKind, CaptchaGuardFactory> = new Map().set(
      CaptchaKind.GOOGLE_RECAPTCHA_V2,
      (service: CaptchaService<string>) => new GoogleRecaptchaV2Guard(service),
    );

    this._guards = this._setupGuards(preGuards, _captchaServices);
  }

  // Create the final correlation
  // a `Map` that contains `CaptchaKind` as key and an `ICaptchaGuard` instance
  private _setupGuards(
    preGuards: ReadonlyMap<CaptchaKind, CaptchaGuardFactory>,
    captchaServices: CaptchaMultiServices,
  ): ReadonlyMap<CaptchaKind, ICaptchaGuard> {
    return Object.keys(captchaServices).reduce(
      // eslint-disable-next-line functional/prefer-readonly-type
      (acc: Map<CaptchaKind, ICaptchaGuard>, key: CaptchaKind) => {
        const captchaService: CaptchaService<unknown> = captchaServices[key];
        const captchaGuardFactory: CaptchaGuardFactory = preGuards.get(key);
        return acc.set(key, captchaGuardFactory(captchaService));
      },
      new Map(),
    );
  }

  private _getCurrentDeviceKind(context: ExecutionContext): DeviceKind {
    const request: { readonly deviceInfo?: DeviceInfoData } = context.switchToHttp().getRequest();
    return request.deviceInfo.deviceKind;
  }

  private _getCaptchaOpts(context: ExecutionContext): CaptchaOpts {
    const maybeRouteOpts: CaptchaOpts = this._reflector.get(metadataKey, context.getHandler());
    const maybeControllerOpts: CaptchaOpts = this._reflector.get(metadataKey, context.getClass());
    const opts: CaptchaOpts | null =
      maybeRouteOpts !== null ? maybeRouteOpts : maybeControllerOpts !== null ? maybeControllerOpts : null;

    return {
      captchaKinds: {
        [DeviceKind.COMPUTER]: opts?.captchaKinds[DeviceKind.COMPUTER] || [],
        [DeviceKind.MOBILE]: opts?.captchaKinds[DeviceKind.MOBILE] || [],
        [DeviceKind.UNKNOWN]: opts?.captchaKinds[DeviceKind.UNKNOWN] || [],
      },
    };
  }

  private _getGuards(kinds: ReadonlyArray<CaptchaKind>): ReadonlyArray<ICaptchaGuard> {
    return kinds.map((kind: CaptchaKind) => this._guards.get(kind)).filter(Boolean);
  }

  private async _validateCaptchas(context: ExecutionContext, guards: ReadonlyArray<ICaptchaGuard>): Promise<boolean> {
    for (let i: number = 0; i < guards.length; i++) {
      const guard: ICaptchaGuard = guards[i];

      try {
        const isValid: boolean = await guard.isValid(context);
        if (typeof isValid === 'boolean' && isValid) return true;
      } catch (exception) {
        // Implementation copied from domain.filter.ts
        const domainError: DomainError | null = isDomainError(exception) ? cleanUpDomainError(exception) : null;

        if (domainError?.errorLevel && domainError?.errorLevel !== 'none') {
          const error: SentryDomainError = new SentryDomainError(domainError);
          this._client.instance().captureException(error, { level: domainError.errorLevel, extra: { ...error } });
        } else if (domainError === null) {
          this._client.instance().captureException(exception, { level: 'error' });
        }
      }
    }

    return false;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const deviceKind: DeviceKind = this._getCurrentDeviceKind(context);
    const captchaKinds: ReadonlyArray<CaptchaKind> = this._getCaptchaOpts(context).captchaKinds[deviceKind];
    if (captchaKinds.length <= 0) return true;

    const guards: ReadonlyArray<ICaptchaGuard> = this._getGuards(captchaKinds);
    const isValid: boolean = await this._validateCaptchas(context, guards);
    if (isValid) return true;

    throw new InvalidCaptchaDomainError();
  }
}
