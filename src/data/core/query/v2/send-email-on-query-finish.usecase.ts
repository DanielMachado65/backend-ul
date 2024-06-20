import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import {
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
} from 'src/domain/_layer/infrastructure/service/notification';
import {
  SendEmailOnQueryFinishDomain,
  SendEmailOnQueryFinishIO,
} from 'src/domain/core/query/v2/send-email-on-query-finish.domain';

@Injectable()
export class SendEmailOnQueryFinishUseCase implements SendEmailOnQueryFinishDomain {
  constructor(
    private readonly _queryRepository: QueryRepository,
    private readonly _userRepository: UserRepository,
    private readonly _notificationService: NotificationServiceGen,
  ) {}

  send(queryId: string): SendEmailOnQueryFinishIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () => this._queryRepository.getById(queryId))
      .map(async (queryDto: QueryDto) => {
        const userDto: UserDto = await this._userRepository.getById(queryDto.userId);
        return { userDto, queryDto };
      })
      .map(({ userDto, queryDto }: { readonly userDto: UserDto; readonly queryDto: QueryDto }) => {
        const userFirstName: string = userDto.name.split(' ')[0];

        this._notificationService.dispatch(NotificationTransport.EMAIL, NotificationType.QUERY_SUCCESS, {
          email: userDto.email,
          name: userFirstName,
          queryCode: queryDto.queryCode,
          queryId: queryDto.id,
          queryName: queryDto.refClass,
        });
      });
  }
}
