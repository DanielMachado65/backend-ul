import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { ListUserWebhooksOutputDto } from 'src/domain/_layer/presentation/dto/list-user-webhooks-output.dto';

export type ListWebhooksErrors = UnknownDomainError;

export type ListWebhooksResult = Either<ListWebhooksErrors, ListUserWebhooksOutputDto>;

export type ListWebhooksIO = EitherIO<ListWebhooksErrors, ListUserWebhooksOutputDto>;

export abstract class ListWebhooksDomain {
  abstract execute(userId: string): ListWebhooksIO;
}
