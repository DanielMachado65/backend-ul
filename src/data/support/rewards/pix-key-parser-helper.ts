import { Injectable } from '@nestjs/common';
import { PixType } from 'src/domain/_layer/presentation/dto/transaction-debit-withdrawal-input.dto';

interface IPixKeyParser {
  type: PixType;
  parser: (pixKey: string) => string;
}

export type ParsedPixKey = {
  pixKeyType: PixType | null;
  pixKeyValue: string | null;
};

@Injectable()
export class PixKeyParserHelper {
  private readonly _pixKeyParser: Map<PixType, IPixKeyParser> = new Map<PixType, IPixKeyParser>()
    .set(PixType.CPF, { type: PixType.CPF, parser: this._parseCpfKey })
    .set(PixType.CNPJ, { type: PixType.CNPJ, parser: this._parseCnpjKey })
    .set(PixType.PHONE, { type: PixType.PHONE, parser: this._parsePhoneKey })
    .set(PixType.EMAIL, { type: PixType.EMAIL, parser: this._parseEmailKey })
    .set(PixType.RANDOM_KEY, { type: PixType.RANDOM_KEY, parser: this._parseRandomKey });

  private _parseCpfKey(pixKey: string): string {
    return pixKey.replace(/\D/g, '');
  }

  private _parseCnpjKey(pixKey: string): string {
    return pixKey.replace(/\D/g, '');
  }

  private _parsePhoneKey(pixKey: string): string {
    return pixKey.replace(/\D/g, '');
  }

  private _parseEmailKey(pixKey: string): string {
    return pixKey.trim().toLowerCase();
  }

  private _parseRandomKey(pixKey: string): string {
    return pixKey;
  }

  parsePix(pixType: string, pixKey: string): ParsedPixKey {
    const pixOptions: IPixKeyParser = this._pixKeyParser.get(PixType[pixType.toUpperCase()]);
    if (!pixOptions) {
      return { pixKeyType: null, pixKeyValue: null };
    }
    const { type, parser }: IPixKeyParser = pixOptions;
    return { pixKeyType: type, pixKeyValue: parser(pixKey) };
  }
}
