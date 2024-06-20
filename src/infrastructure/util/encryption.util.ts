import { Injectable } from '@nestjs/common';
import { Cipher, createCipher, createDecipher, Decipher } from 'crypto';
import { EnvService, ENV_KEYS } from '../framework/env.service';

@Injectable()
export class EncryptionUtil {
  private readonly _algorithm: string;
  private readonly _key: string;

  constructor(private readonly _envService: EnvService) {
    this._key = this._envService.get(ENV_KEYS.ENCRYPTION_KEY);
    this._algorithm = this._envService.get(ENV_KEYS.ENCRYPTION_ALGORITHM);
  }

  encrypt(text: string): string {
    const cipher: Cipher = createCipher(this._algorithm, this._key);
    const encryptedText: string = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    return encryptedText;
  }

  decrypt(text: string): string {
    const decipher: Decipher = createDecipher(this._algorithm, this._key);
    const decryptedText: string = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
    return decryptedText;
  }

  compare(notEncryptedText: string, encryptedText: string): boolean {
    return this.encrypt(notEncryptedText) === encryptedText;
  }
}
