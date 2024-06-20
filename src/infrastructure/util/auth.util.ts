import { Injectable } from '@nestjs/common';
import { JwtUtil } from './jwt.util';

export type TokenData = {
  readonly data: string;
  readonly id?: string;
  readonly name?: string;
  readonly email?: string;
  readonly type?: number;
};

@Injectable()
export class AuthUtil {
  constructor(private readonly _jwtUtil: JwtUtil) {}

  encodeToken(tokenData: TokenData, expiresIn: string | number = '24h'): string {
    return this._jwtUtil.signToken(tokenData, null, expiresIn);
  }

  async verifyToken(token?: string): Promise<TokenData> {
    return this._jwtUtil
      .verifyRegularToken<TokenData>(token)
      .catch(() => this._jwtUtil.verifyAdminToken<TokenData>(token));
  }
}
