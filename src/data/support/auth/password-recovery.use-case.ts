import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { PasswordRecoveryDomain, PasswordRecoveryIO } from '../../../domain/support/auth/password-recovery.domain';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { BadRequestDomainError, UnknownDomainError } from '../../../domain/_entity/result.error';
import { UserDto } from '../../../domain/_layer/data/dto/user.dto';
import {
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
} from '../../../domain/_layer/infrastructure/service/notification';
import { AuthHelper } from './auth.helper';

@Injectable()
export class PasswordRecoveryUseCase implements PasswordRecoveryDomain {
  constructor(
    private readonly _authHelper: AuthHelper,
    private readonly _userRepository: UserRepository,
    private readonly _notificationService: NotificationServiceGen,
  ) {}

  private async _dispatchEmailIfUserFound(userDto: UserDto | null): Promise<void> {
    if (userDto) {
      const { id, name, email, password, createdAt }: UserDto = userDto;
      const urlToRedirect: string = this._authHelper.generateUrlToChangePassword(id, password, createdAt);
      await this._notificationService.dispatch(NotificationTransport.EMAIL, NotificationType.USER_RECOVER_PASSWORD, {
        name,
        email,
        urlToRedirect,
      });
    }
  }

  recoverPassword(email: string, cpf: string): PasswordRecoveryIO {
    return EitherIO.of(UnknownDomainError.toFn(), () => ({ email, cpf }))
      .filter(BadRequestDomainError.toFn(), () => this._isValid(email, cpf))
      .map(() => this._userRepository.getByEmailOrCPFWithPassword(email, cpf))
      .tap(this._dispatchEmailIfUserFound.bind(this))
      .map(() => null);
  }

  private _isValid(email: string, cpf: string): boolean {
    return !!email || !!cpf;
  }
}
