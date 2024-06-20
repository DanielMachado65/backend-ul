import { Injectable } from '@nestjs/common';
import { Cipher, createCipher, createDecipher, Decipher } from 'crypto';
import { ENV_KEYS, EnvService } from '../framework/env.service';

@Injectable()
export class FipeCodeObfuscatorUtil {
  private readonly _algorithm: string;
  private readonly _key: string;
  private readonly _fixedIV: Buffer;

  constructor(private readonly _envService: EnvService) {
    this._algorithm = this._envService.get(ENV_KEYS.FIPE_ENCRYPTION_ALGORITHM);
    this._key = this._envService.get(ENV_KEYS.FIPE_ENCRYPTION_KEY);
  }

  obfuscateFipeCode(fipe: string): string {
    if (!fipe.match(/^\d{7}$/)) throw new Error('Not valid fipe nor formatted');
    const cipher: Cipher = createCipher(this._algorithm, this._key);
    const encryptedText: string = cipher.update(fipe, 'utf8', 'hex') + cipher.final('hex');
    return encryptedText;
  }

  deobfuscateFipeCode(encrypted: string): string {
    const decipher: Decipher = createDecipher(this._algorithm, this._key);
    const decryptedText: string = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    return decryptedText;
  }
}
