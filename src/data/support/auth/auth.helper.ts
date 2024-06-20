import { Injectable } from '@nestjs/common';
import { JwtUtil } from '../../../infrastructure/util/jwt.util';
import { EnvService } from '../../../infrastructure/framework/env.service';

type TokenParams = {
  readonly data: {
    readonly id: string;
    readonly activeUser: boolean;
  };
};

@Injectable()
export class AuthHelper {
  private readonly _resetPasswordUrl: string;

  constructor(private readonly _envService: EnvService, private readonly _jwtUtil: JwtUtil) {
    const baseUrl: string = this._envService.isDevEnv()
      ? 'https://olhonocarro-website-git-develop-checklist-team.vercel.app'
      : 'https://olhonocarro.com.br';
    this._resetPasswordUrl = `${baseUrl}/redefinir-senha?resetToken=`;
  }

  generateChangePasswordSecret(userPassword: string, userCreatedAt: string): string {
    return `${userPassword}-${new Date(userCreatedAt).getTime()}`;
  }

  generateResetToken(id: string, password: string, createdAt: string, shouldActivateUser: boolean): string {
    const secret: string = this.generateChangePasswordSecret(password, createdAt);
    const tokenParams: TokenParams = { data: { id, activeUser: shouldActivateUser } };
    return this._jwtUtil.signToken<TokenParams>(tokenParams, secret, '15m');
  }

  generateUrlToChangePassword(id: string, password: string, createdAt: string): string {
    const resetToken: string = this.generateResetToken(id, password, createdAt, false);
    return `${this._resetPasswordUrl}${resetToken}`;
  }

  generateUrlToActiveUser(id: string, password: string, createdAt: string): string {
    const resetToken: string = this.generateResetToken(id, password, createdAt, true);
    return `${this._resetPasswordUrl}${resetToken}`;
  }
}
