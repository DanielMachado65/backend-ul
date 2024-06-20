import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  InvalidCredentialsDomainError,
  UnknownDomainError,
  UserDisabledDomainError,
} from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { SignInDomain, SignInIO } from 'src/domain/support/auth/sign-in.domain';
import { EncryptionUtil } from 'src/infrastructure/util/encryption.util';
import { TokenEntity } from '../../../domain/_entity/token.entity';
import { DeviceKind } from '../../../domain/_layer/infrastructure/middleware/device-info.middleware';
import { EventEmitterService } from '../../../domain/_layer/infrastructure/service/event/event.service';
import { AppEventDispatcher } from '../../../infrastructure/decorators/events.decorator';
import { AuthUtil } from '../../../infrastructure/util/auth.util';

@Injectable()
export class SignInUseCase implements SignInDomain {
  private static _defaultExpirationTime: string = '1d';
  private static _mobileExpirationTime: string = '180d';

  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _encryptionUtil: EncryptionUtil,
    private readonly _authUtil: AuthUtil,
    private readonly _notificationInfraService: NotificationInfrastructure,
    @AppEventDispatcher() private readonly _eventEmitterService: EventEmitterService,
  ) {}

  calculateExpiration(deviceKind: DeviceKind): string {
    return deviceKind === DeviceKind.MOBILE
      ? SignInUseCase._mobileExpirationTime
      : SignInUseCase._defaultExpirationTime;
  }

  encodeToken(user: UserDto, expiresIn?: string): TokenEntity {
    const token: string = this._authUtil.encodeToken(
      {
        data: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
      },
      expiresIn,
    );
    return { token };
  }

  signIn(email: string, password: string, deviceKind: DeviceKind, reqParentId: string): SignInIO {
    type Data = { readonly user: UserDto; readonly token: TokenEntity };
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getByEmailWithPassword(email))
      .filter(InvalidCredentialsDomainError.toFn(), Boolean)
      .filter(InvalidCredentialsDomainError.toFn(), (user: UserDto) =>
        this._encryptionUtil.compare(password, user.password),
      )
      .filter(UserDisabledDomainError.toFn(), (user: UserDto) => user.status)
      .map((user: UserDto) => {
        const expiresIn: string = this.calculateExpiration(deviceKind);
        const token: TokenEntity = this.encodeToken(user, expiresIn);
        return { user, token };
      })
      .tap(({ user }: Data) => this._userRepository.updateById(user.id, { lastLogin: new Date().toISOString() }))
      .tap(({ user }: Data) => {
        this._eventEmitterService.dispatchLoginSucceeded({ userId: user.id, reqParentId: reqParentId });
      })
      .tap(({ user }: Data) =>
        this._notificationInfraService.addSubscriber({
          subscriberId: user.id,
          email: user.email,
          firstName: user.name,
          phoneNumber: user.phoneNumber,
        }),
      )
      .map(({ token }: Data) => token);
  }
}
