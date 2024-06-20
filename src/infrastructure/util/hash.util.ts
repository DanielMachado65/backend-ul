import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashUtil {
  async hash(plainText: string): Promise<string> {
    const salt: string = await bcrypt.genSalt();
    const digest: string = await bcrypt.hash(plainText, salt);
    return digest;
  }

  async compare(plaintext: string, digest: string): Promise<boolean> {
    const isValid: boolean = await bcrypt.compare(plaintext, digest);
    return isValid;
  }
}
