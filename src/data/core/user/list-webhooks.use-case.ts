import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';

import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { ListWebhooksDomain, ListWebhooksIO } from 'src/domain/core/user/list-webhooks.domain';

@Injectable()
export class ListWebhooksUseCase implements ListWebhooksDomain {
  constructor(private readonly _userRepository: UserRepository) {}

  execute(userId: string): ListWebhooksIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () => await this._userRepository.getById(userId)).map(
      (user: UserDto) => {
        return {
          webhookUrls: user.webhookUrls,
        };
      },
    );
  }
}
