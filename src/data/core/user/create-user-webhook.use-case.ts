import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError, WebhookMaxLimitError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';

import { CreateUserWebhookDomain, CreateUserWebhookIO } from 'src/domain/core/user/create-user-webhook.domain';

@Injectable()
export class CreateUserWebhookUseCase implements CreateUserWebhookDomain {
  private static readonly MAX_URLS: number = 5;

  constructor(private readonly _userRepository: UserRepository) {}

  execute(userId: string, urls: string[]): CreateUserWebhookIO {
    return EitherIO.of(UnknownDomainError.toFn(), urls)
      .filter(WebhookMaxLimitError.toFn(), (urls: string[]) => urls.length <= CreateUserWebhookUseCase.MAX_URLS)
      .map(async (urls: string[]) => {
        const user: UserDto = await this._userRepository.updateById(userId, { webhookUrls: urls });

        return {
          webhookUrls: user.webhookUrls,
        };
      });
  }
}
