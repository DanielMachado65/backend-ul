import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { NoQueryFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { AnalyticsDto } from 'src/domain/_layer/data/dto/analytics.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { AnalyticsRepository } from 'src/domain/_layer/infrastructure/repository/analytics.repository';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { MarkintingService } from 'src/domain/_layer/infrastructure/service/marketing.service';
import {
  TrackPartnerInteractionDomain,
  TrackPartnerInteractionIO,
} from 'src/domain/support/tracking/track-partner-interaction.domain';
import { StringUtil } from 'src/infrastructure/util/string.util';

@Injectable()
export class TrackPartnerInteractionUseCase implements TrackPartnerInteractionDomain {
  constructor(
    private readonly _markintingService: MarkintingService,
    private readonly _userRepository: UserRepository,
    private readonly _queryRepository: QueryRepository,
    private readonly _analyticsRepository: AnalyticsRepository,
  ) {}

  track(userId: string, queryId: string, link: string): TrackPartnerInteractionIO {
    return this._fetch(userId, queryId)
      .flatMap(([user, query]: [UserDto, QueryDto]) =>
        this._insertAnalytics(user, query, link).map(() => [user, query]),
      )
      .map(([user, query]: [UserDto, QueryDto]) =>
        this._markintingService.registerClickOnButtonDebts({
          email: user.email,
          plate: query.queryKeys?.plate,
          model: query.responseJson?.modelo as string,
          brand: query.responseJson?.marca as string,
          brandModel: query.responseJson?.marcaModelo as string,
          phone: user.phoneNumber,
          birthday: user.createdAt,
          firstName: StringUtil.firstName(user.name),
          lastName: StringUtil.lastName(user.name),
        }),
      );
  }

  private _fetch(userId: string, queryId: string): EitherIO<UnknownDomainError, [UserDto, QueryDto]> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(userId)).zip(
      EitherIO.from(NoQueryFoundDomainError.toFn(), () => this._queryRepository.getById(queryId)),
      (user: UserDto, query: QueryDto) => [user, query],
    );
  }

  private _insertAnalytics(user: UserDto, query: QueryDto, link: string): EitherIO<UnknownDomainError, AnalyticsDto> {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._analyticsRepository.insert({ link, placa: query.queryKeys?.plate, email: user.email, queryId: query.id }),
    );
  }
}
