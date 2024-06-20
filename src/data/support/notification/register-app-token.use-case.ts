import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  BadRequestDomainError,
  NoUserFoundDomainError,
  NotificationUpdateCouldNotProcess,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { NotificationInfrastructureSubscriber } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { RegisterAppTokenDomain, RegisterAppTokenIO } from 'src/domain/support/notification/register-app-token.domain';

@Injectable()
export class RegisterAppTokenUseCase implements RegisterAppTokenDomain {
  constructor(
    private readonly _notificationInfraService: NotificationInfrastructure,
    private readonly _userRepository: UserRepository,
  ) {}

  addToken(userId: string, appToken: string): RegisterAppTokenIO {
    return EitherIO.of(UnknownDomainError.toFn(), appToken)
      .filter(BadRequestDomainError.toFn(), RegisterAppTokenUseCase._validateToken)
      .flatMap((token: string) => this._getUserWithAppToken(token, userId))
      .flatMap(({ user }: { readonly user: UserDto }) => this._findOrCreateUser(user))
      .flatMap((user: NotificationInfrastructureSubscriber) => this._updateTokenForUser(user, appToken));
  }

  private static _validateToken(token: string): boolean {
    return typeof token === 'string' && token.length > 0;
  }

  private _getUserWithAppToken(
    appToken: string,
    userId: string,
  ): EitherIO<UnknownDomainError, { readonly appToken: string; readonly user: UserDto }> {
    return EitherIO.from<UnknownDomainError, UserDto>(UnknownDomainError.toFn(), () =>
      this._userRepository.getById(userId),
    )
      .filter(UnknownDomainError.toFn(), (user: UserDto | null) => user !== null)
      .map((user: UserDto) => ({ appToken, user }));
  }

  private _findOrCreateUser(user: UserDto): EitherIO<UnknownDomainError, NotificationInfrastructureSubscriber> {
    return EitherIO.from(NoUserFoundDomainError.toFn(), async () => {
      const subscriber: NotificationInfrastructureSubscriber | null =
        await this._notificationInfraService.findSubscriber(user.id);

      if (!subscriber) {
        const data: NotificationInfrastructureSubscriber = await this._notificationInfraService.addSubscriber({
          subscriberId: user.id,
          email: user.email,
          firstName: user.name,
          phoneNumber: user.phoneNumber,
        });
        return data;
      }

      return subscriber;
    });
  }

  private _updateTokenForUser(
    user: NotificationInfrastructureSubscriber,
    appToken: string,
  ): EitherIO<NotificationUpdateCouldNotProcess, { appTokenRegistered: boolean }> {
    return EitherIO.from(NotificationUpdateCouldNotProcess.toFn(), async () => {
      await this._notificationInfraService.removeAllTokens(user.subscriberId);
      const isCreated: boolean = await this._notificationInfraService.setCredentials(user.subscriberId, [appToken]);
      return { appTokenRegistered: isCreated };
    });
  }
}
