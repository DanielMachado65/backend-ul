import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { NoServiceFoundDomainError, NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import {
  NotificationEmailIdentifier,
  NotificationEmailPotenicalUserInput,
  NotificationInfrastructureSubscriber,
} from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import {
  SendPotencialUserEmailDomain,
  SendPotencialUserEmailIO,
} from 'src/domain/support/email/send-potencial-user-email.domain';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';

type UserWithUsers = {
  readonly toSend: ReadonlyArray<UserDto>;
  readonly users: ReadonlyArray<UserDto>;
};

@Injectable()
export class SendPotencialUserEmailUseCase implements SendPotencialUserEmailDomain {
  constructor(
    private readonly _notificationInfraService: NotificationInfrastructure,
    private readonly _userRepository: UserRepository,
  ) {}

  send(to: ReadonlyArray<string>, usersIds: ReadonlyArray<Pick<UserDto, 'id'>>): SendPotencialUserEmailIO {
    return EitherIO.of(UnknownDomainError.toFn(), to)
      .map((to: ReadonlyArray<string>) => this._findUsers(to))
      .filter(NoUserFoundDomainError.toFn(), (users: ReadonlyArray<UserDto>) => users.length > 0)
      .map((users: ReadonlyArray<UserDto>) => this._findOrCreateUsers(users))
      .map((users: ReadonlyArray<UserDto>) => this._findPayloadUsers(users, usersIds))
      .filter(NoUserFoundDomainError.toFn(), ({ users }: UserWithUsers) => users.length > 0)
      .map(({ toSend, users }: UserWithUsers) => this._sendNotification({ toSend, users }))
      .map((users: ReadonlyArray<UserDto>) => this._wasInviteSent(users));
  }

  private async _sendNotification({ toSend, users }: UserWithUsers): Promise<ReadonlyArray<UserDto>> {
    try {
      const isSent: boolean = await this._notificationInfraService.sendEmail(
        NotificationEmailIdentifier.POTENCIAL_USER,
        this._parseUserstoSend(toSend),
        {
          users,
        },
      );
      if (!isSent) throw new NoServiceFoundDomainError();

      return users;
    } catch (error) {
      return null;
    }
  }

  private async _findUsers(to: ReadonlyArray<string>): Promise<ReadonlyArray<UserDto>> {
    return await Promise.all(
      to.map(async (email: string) => {
        return await this._userRepository.getByEmail(email);
      }),
    );
  }

  private async _findOrCreateUsers(users: ReadonlyArray<UserDto>): Promise<ReadonlyArray<UserDto>> {
    return await Promise.all(
      users.map(async (user: UserDto) => {
        return await this._findOrCreateUser(user);
      }),
    );
  }

  private async _findOrCreateUser(user: UserDto): Promise<UserDto> {
    const subscriber: NotificationInfrastructureSubscriber | null = await this._notificationInfraService.findSubscriber(
      user.id,
    );

    if (!subscriber) {
      await this._notificationInfraService.addSubscriber({
        subscriberId: user.id,
        email: user.email,
        firstName: user.name,
        phoneNumber: user.phoneNumber,
      });
    } else if (subscriber.email !== user.email) {
      await this._notificationInfraService.updateSubscriber({
        subscriberId: user.id,
        email: user.email,
        firstName: this._getFirstName(user.name),
        lastName: this._getLastName(user.name),
        phoneNumber: user.phoneNumber,
      });
    }

    return user;
  }

  private async _findPayloadUsers(
    toSend: ReadonlyArray<UserDto>,
    users: ReadonlyArray<Pick<UserDto, 'id'>>,
  ): Promise<{
    readonly toSend: ReadonlyArray<UserDto>;
    readonly users: ReadonlyArray<UserDto>;
  }> {
    const dbUsers: ReadonlyArray<UserDto> = await this._userRepository.getByIds(users);

    return {
      toSend,
      users: dbUsers,
    };
  }

  private async _wasInviteSent(users: ReadonlyArray<UserDto>): Promise<boolean> {
    const data: ReadonlyArray<UserDto> = await this._userRepository.updateManyBy(users, {
      isEligibleForMigration: true,
    });

    if (data.length === users.length) return true;

    return false;
  }

  private _parseUserstoSend(users: ReadonlyArray<UserDto>): ReadonlyArray<NotificationEmailPotenicalUserInput> {
    return users.map((user: UserDto) => {
      return {
        subscriberId: user.id,
        email: user.email,
        firstName: this._getFirstName(user.name),
        lastName: this._getLastName(user.name),
        phoneNumber: user.phoneNumber,
      };
    });
  }

  private _getFirstName(name: string): string {
    return name.split(' ')[0] || '';
  }

  private _getLastName(name: string): string {
    return name.split(' ')[1] || '';
  }
}
