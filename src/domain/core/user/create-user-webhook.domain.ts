import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';

import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { ListUserWebhooksOutputDto } from 'src/domain/_layer/presentation/dto/list-user-webhooks-output.dto';

export type CreateUserWebhookErrors = UnknownDomainError;

export type CreateUserWebhookResult = Either<CreateUserWebhookErrors, ListUserWebhooksOutputDto>;

export type CreateUserWebhookIO = EitherIO<CreateUserWebhookErrors, ListUserWebhooksOutputDto>;

export abstract class CreateUserWebhookDomain {
  abstract execute(userId: string, urls: string[]): CreateUserWebhookIO;
}
