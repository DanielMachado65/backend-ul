import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { ENV_KEYS, EnvService } from '../framework/env.service';
import { PromiseFulfilled, PromiseRejected } from './promise.util';
import { TokenExpiredDomainError } from 'src/domain/_entity/result.error';

@Injectable()
export class JwtUtil {
  constructor(private readonly _envService: EnvService) {}

  decodeToken<TokenPayload extends JwtPayload>(token: string): TokenPayload {
    return jwt.decode(token) as TokenPayload;
  }

  verifyToken<TokenPayload extends JwtPayload>(secret: string, token: string): Promise<TokenPayload> {
    return new Promise((resolve: PromiseFulfilled<TokenPayload>, reject: PromiseRejected) => {
      jwt.verify(token, secret, { ignoreExpiration: false }, (error: VerifyErrors | null, dataDecoded: JwtPayload) => {
        // Verifica se o token expirou
        if (error || dataDecoded === undefined) {
          if (error.name === 'TokenExpiredError') reject(new TokenExpiredDomainError());

          reject('Invalid token!');
        } else {
          resolve(dataDecoded as TokenPayload);
        }
      });
    }).then((tokenPayload: TokenPayload) => tokenPayload);
  }

  verifyRegularToken<TokenPayload extends JwtPayload>(token: string): Promise<TokenPayload> {
    return this.verifyToken<TokenPayload>(this._envService.get<string>(ENV_KEYS.REGULAR_TOKEN_SECRET), token);
  }

  verifyAdminToken<TokenPayload extends JwtPayload>(token: string): Promise<TokenPayload> {
    return this.verifyToken<TokenPayload>(this._envService.get<string>(ENV_KEYS.ADMIN_TOKEN_SECRET), token);
  }

  signToken<Payload extends Record<string, unknown>>(
    params: Payload,
    maybeSecret?: string,
    expiresIn: string | number | null = '24h',
  ): string {
    const secret: string = maybeSecret ? maybeSecret : this._envService.get(ENV_KEYS.REGULAR_TOKEN_SECRET);
    return jwt.sign(params, secret, expiresIn ? { expiresIn } : {});
  }
}
