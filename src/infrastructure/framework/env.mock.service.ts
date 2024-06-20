import { Injectable, Provider } from '@nestjs/common';
import { EnvService } from './env.service';

type EnvVariableName =
  | 'ADMIN_TOKEN_SECRET'
  | 'AMAZON_S3_URL'
  | 'APPLICATION_ID'
  | 'ARC_TOKEN'
  | 'ARC_URL'
  | 'BRASIL_API_BASE_URL'
  | 'CNPJ1'
  | 'CNPJ2'
  | 'DATABASE_CONNECTION_STRING'
  | 'ENCRYPTION_ALGORITHM'
  | 'ENCRYPTION_KEY'
  | 'ENOTAS_URL_BASE'
  | 'GOOGLE_RECAPTCHA_V2_SECRETS'
  | 'GOOGLE_RECAPTCHA_V2_URL'
  | 'GROWTH_BOOK_API_HOST'
  | 'GROWTH_BOOK_CLIENT_KEY'
  | 'HTTP_TIMEOUT'
  | 'IBGE_BASE_URL'
  | 'INDICATE_AND_EARN_BASE_URL'
  | 'IUGU_ACCOUNT_ID'
  | 'IUGU_API_BASE_URL'
  | 'IUGU_API_KEY'
  | 'LEGACY_API_BASE_URL'
  | 'LOG_SERVICE_BASE_URL'
  | 'MAILER_DEFAULT_FROM_EMAIL'
  | 'MAILSENDER_MK_API_KEY'
  | 'MAILSENDER_MK_SERVER'
  | 'MAILSENDER_TR_KEY'
  | 'MOLECULAR_BASE_URL'
  | 'NODE_ENV'
  | 'OWNER_REVIEW_URL'
  | 'PORT'
  | 'PROV1_ENOTAS_API_KEY'
  | 'PROV1_ENOTAS_PROVIDER_ID'
  | 'PROV2_ENOTAS_API_KEY'
  | 'PROV2_ENOTAS_PROVIDER_ID'
  | 'REGULAR_TOKEN_SECRET'
  | 'ROSETTA_BASE_URL'
  | 'SENTRY_DSN'
  | 'TAG_MANAGER_URL'
  | 'TETRIS_BASE_URL'
  | 'TETRIS_TOKEN'
  | 'THROTTLE_LIMIT'
  | 'THROTTLE_TTL'
  | 'UCC_URL'
  | 'VIACEP_BASE_URL';

@Injectable()
export class EnvMockService {
  private _envs: Record<EnvVariableName, unknown> = {
    ADMIN_TOKEN_SECRET: 'censored',
    AMAZON_S3_URL: 'censored',
    APPLICATION_ID: 'censored',
    ARC_TOKEN: 'censored',
    ARC_URL: 'censored',
    BRASIL_API_BASE_URL: 'censored',
    CNPJ1: 'censored',
    CNPJ2: 'censored',
    DATABASE_CONNECTION_STRING: 'censored',
    ENCRYPTION_ALGORITHM: 'aes-256-ctr',
    ENCRYPTION_KEY: 'censored',
    ENOTAS_URL_BASE: 'censored',
    GOOGLE_RECAPTCHA_V2_SECRETS: 'censored',
    GOOGLE_RECAPTCHA_V2_URL: 'censored',
    GROWTH_BOOK_API_HOST: 'censored',
    GROWTH_BOOK_CLIENT_KEY: 'censored',
    HTTP_TIMEOUT: 9999,
    IBGE_BASE_URL: 'censored',
    INDICATE_AND_EARN_BASE_URL: 'censored',
    IUGU_ACCOUNT_ID: 'censored',
    IUGU_API_BASE_URL: 'censored',
    IUGU_API_KEY: 'censored',
    LEGACY_API_BASE_URL: 'censored',
    LOG_SERVICE_BASE_URL: 'censored',
    MAILER_DEFAULT_FROM_EMAIL: 'censored',
    MAILSENDER_MK_API_KEY: 'censored',
    MAILSENDER_MK_SERVER: 'censored',
    MAILSENDER_TR_KEY: 'censored',
    MOLECULAR_BASE_URL: 'censored',
    NODE_ENV: 'development',
    OWNER_REVIEW_URL: 'censored',
    PORT: process.env.PORT,
    PROV1_ENOTAS_API_KEY: 'censored',
    PROV1_ENOTAS_PROVIDER_ID: 'censored',
    PROV2_ENOTAS_API_KEY: 'censored',
    PROV2_ENOTAS_PROVIDER_ID: 'censored',
    REGULAR_TOKEN_SECRET: 'censored',
    ROSETTA_BASE_URL: 'censored',
    SENTRY_DSN: 'censored',
    TAG_MANAGER_URL: 'censored',
    TETRIS_BASE_URL: 'censored',
    TETRIS_TOKEN: 'censored',
    THROTTLE_LIMIT: 9999,
    THROTTLE_TTL: 60,
    UCC_URL: 'censored',
    VIACEP_BASE_URL: 'censored',
  };

  get<Value>(key: string): Value {
    return this._envs[key] as Value;
  }

  isDevEnv(): boolean {
    return true;
  }

  isHomologEnv(): boolean {
    return false;
  }

  isProdEnv(): boolean {
    return false;
  }
}

export const envMockProvider: Provider = { provide: EnvService, useClass: EnvMockService };
