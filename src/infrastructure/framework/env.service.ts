import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { SchemaMap } from 'joi';

export type EnvVariableName =
  | 'NODE_ENV'
  | 'PORT'
  | 'REGULAR_TOKEN_SECRET'
  | 'ADMIN_TOKEN_SECRET'
  | 'DATABASE_CONNECTION_STRING'
  | 'HTTP_TIMEOUT'
  | 'THROTTLE_TTL'
  | 'THROTTLE_LIMIT'
  | 'MOLECULAR_BASE_URL'
  | 'ROSETTA_BASE_URL'
  | 'LEGACY_API_BASE_URL'
  | 'UCC_URL'
  | 'OWNER_REVIEW_URL'
  | 'IUGU_ACCOUNT_ID'
  | 'IUGU_API_BASE_URL'
  | 'IUGU_API_KEY'
  | 'APPLICATION_ID'
  | 'MAILER_DEFAULT_FROM_EMAIL'
  | 'MAILSENDER_MK_API_KEY'
  | 'MAILSENDER_TR_KEY'
  | 'MAILSENDER_MK_SERVER'
  | 'ENCRYPTION_KEY'
  | 'ENCRYPTION_ALGORITHM'
  | 'SENTRY_DSN'
  | 'LOG_SERVICE_BASE_URL'
  | 'IBGE_BASE_URL'
  | 'VIACEP_BASE_URL'
  | 'BRASIL_API_BASE_URL'
  | 'TETRIS_BASE_URL'
  | 'TETRIS_TOKEN'
  | 'SCHEDULER_TOKEN'
  | 'AMAZON_S3_URL'
  | 'ARC_URL'
  | 'ARC_TOKEN'
  | 'ENOTAS_URL_BASE'
  | 'CNPJ1'
  | 'CNPJ2'
  | 'PROV1_ENOTAS_API_KEY'
  | 'PROV1_ENOTAS_PROVIDER_ID'
  | 'PROV2_ENOTAS_API_KEY'
  | 'PROV2_ENOTAS_PROVIDER_ID'
  | 'INDICATE_AND_EARN_BASE_URL'
  | 'TAG_MANAGER_URL'
  | 'GOOGLE_RECAPTCHA_V2_URL'
  | 'GOOGLE_RECAPTCHA_V2_SECRETS'
  | 'GROWTH_BOOK_API_HOST'
  | 'GROWTH_BOOK_CLIENT_KEY'
  | 'RABBIT_MQ_URL'
  | 'MY_CARS_PREMIUM_PLAN_ID'
  | 'CORVETTE_BASE_URL'
  | 'REDIS_CONNECTION_STRING'
  | 'NOVU_API_KEY'
  | 'WEB_SITE_BASE_URL'
  | 'REDIS_URL'
  | 'REDIS_PORT'
  | 'FIPE_API_BASE_URL'
  | 'FIPE_ENCRYPTION_KEY'
  | 'FIPE_ENCRYPTION_ALGORITHM'
  | 'BUCKET_SITEMAP_ACCESS_KEY_ID'
  | 'BUCKET_SITEMAP_SECRET_ACCESS_KEY'
  | 'BUCKET_SITEMAP_REGION'
  | 'BUCKET_SITEMAP_ENDPOINT'
  | 'FORCE_ENABLE_SITEMAP'
  | 'FORCE_REFRESH_SITEMAP_BOOTSTRAP'
  | 'SUBSCRIPTION_STRATEGY_REF'
  | 'MUSTANG_URL_BASE'
  | 'N8N_WEBHOOK_BASE_URL'
  | 'NOVU_BASE_URL';

type EnvSchema = Record<EnvVariableName, EnvVariableName>;

const devEnv: string = 'development';
const prodEnv: string = 'production';
const homologEnv: string = 'homolog';
const schema: Record<EnvVariableName, unknown> = {
  NODE_ENV: Joi.string().valid(devEnv, prodEnv, homologEnv).default(prodEnv),
  PORT: Joi.number().min(1).max(65535).required(),
  REGULAR_TOKEN_SECRET: Joi.string().required(),
  ADMIN_TOKEN_SECRET: Joi.string().required(),
  DATABASE_CONNECTION_STRING: Joi.string().required(),
  HTTP_TIMEOUT: Joi.number().min(1).required(),
  THROTTLE_TTL: Joi.number().min(1).required(),
  THROTTLE_LIMIT: Joi.number().min(1).required(),
  MOLECULAR_BASE_URL: Joi.string().required(),
  ROSETTA_BASE_URL: Joi.string().required(),
  LEGACY_API_BASE_URL: Joi.string().required(),
  UCC_URL: Joi.string().required(),
  OWNER_REVIEW_URL: Joi.string().required(),
  IUGU_ACCOUNT_ID: Joi.string().required(),
  IUGU_API_BASE_URL: Joi.string().required(),
  IUGU_API_KEY: Joi.string().required(),
  APPLICATION_ID: Joi.string().required(),
  MAILER_DEFAULT_FROM_EMAIL: Joi.string().required(),
  MAILSENDER_TR_KEY: Joi.string().required(),
  MAILSENDER_MK_SERVER: Joi.string().required(),
  MAILSENDER_MK_API_KEY: Joi.string().required(),
  ENCRYPTION_KEY: Joi.string().required(),
  ENCRYPTION_ALGORITHM: Joi.string().required(),
  SENTRY_DSN: Joi.string().required(),
  TETRIS_BASE_URL: Joi.string().required(),
  TETRIS_TOKEN: Joi.string().required(),
  SCHEDULER_TOKEN: Joi.string().required(),
  LOG_SERVICE_BASE_URL: Joi.string().required(),
  IBGE_BASE_URL: Joi.string().required(),
  VIACEP_BASE_URL: Joi.string().required(),
  BRASIL_API_BASE_URL: Joi.string().required(),
  AMAZON_S3_URL: Joi.string().required(),
  ARC_URL: Joi.string().required(),
  ARC_TOKEN: Joi.string().required(),
  ENOTAS_URL_BASE: Joi.string().required(),
  CNPJ1: Joi.string().required(),
  CNPJ2: Joi.string().required(),
  PROV1_ENOTAS_API_KEY: Joi.string().required(),
  PROV1_ENOTAS_PROVIDER_ID: Joi.string().required(),
  PROV2_ENOTAS_API_KEY: Joi.string().required(),
  PROV2_ENOTAS_PROVIDER_ID: Joi.string().required(),
  INDICATE_AND_EARN_BASE_URL: Joi.string().required(),
  TAG_MANAGER_URL: Joi.string().required(),
  GOOGLE_RECAPTCHA_V2_URL: Joi.string().required(),
  GOOGLE_RECAPTCHA_V2_SECRETS: Joi.string().required(),
  GROWTH_BOOK_API_HOST: Joi.string().required(),
  GROWTH_BOOK_CLIENT_KEY: Joi.string().required(),
  RABBIT_MQ_URL: Joi.string().required(),
  MY_CARS_PREMIUM_PLAN_ID: Joi.string().required(),
  CORVETTE_BASE_URL: Joi.string().required(),
  REDIS_CONNECTION_STRING: Joi.string().required(),
  NOVU_API_KEY: Joi.string().required(),
  WEB_SITE_BASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  REDIS_PORT: Joi.string().required(),
  FIPE_API_BASE_URL: Joi.string().required(),
  FIPE_ENCRYPTION_KEY: Joi.string().required(),
  FIPE_ENCRYPTION_ALGORITHM: Joi.string().required(),
  BUCKET_SITEMAP_ACCESS_KEY_ID: Joi.string().required(),
  BUCKET_SITEMAP_SECRET_ACCESS_KEY: Joi.string().required(),
  BUCKET_SITEMAP_REGION: Joi.string().required(),
  BUCKET_SITEMAP_ENDPOINT: Joi.string().required(),
  FORCE_ENABLE_SITEMAP: Joi.string().required(),
  FORCE_REFRESH_SITEMAP_BOOTSTRAP: Joi.string().required(),
  SUBSCRIPTION_STRATEGY_REF: Joi.string().required(),
  MUSTANG_URL_BASE: Joi.string().required(),
  N8N_WEBHOOK_BASE_URL: Joi.string().required(),
  NOVU_BASE_URL: Joi.string().required(),
};
const envKeysReducer = (acc: EnvSchema, key: EnvVariableName): EnvSchema => ({
  ...acc,
  [key]: key,
});

export const envSchema: Joi.ObjectSchema = Joi.object(schema as SchemaMap);

export const ENV_KEYS: EnvSchema = Object.keys(schema).reduce(envKeysReducer, {} as EnvSchema);

@Injectable()
export class EnvService {
  constructor(private readonly _configService: ConfigService) {}

  get<Value>(key: EnvVariableName): Value {
    return this._configService.get<Value>(key as string);
  }

  isDevEnv(): boolean {
    return this._configService.get<string>(ENV_KEYS.NODE_ENV) === devEnv;
  }

  isHomologEnv(): boolean {
    return this._configService.get<string>(ENV_KEYS.NODE_ENV) === homologEnv;
  }

  isProdEnv(): boolean {
    return this._configService.get<string>(ENV_KEYS.NODE_ENV) === prodEnv;
  }
}
