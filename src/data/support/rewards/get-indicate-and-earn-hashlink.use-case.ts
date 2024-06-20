import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { NoUserFoundDomainError, ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { IndicateAndEarnService } from 'src/domain/_layer/infrastructure/service/indicate-and-earn.service';
import { MarkintingService } from 'src/domain/_layer/infrastructure/service/marketing.service';
import {
  GetIndicateAndEarnHashlinkDomain,
  GetIndicateAndEarnHashlinkIO,
} from 'src/domain/support/rewards/get-indicate-and-earn-hashlink.domain';
import { StringUtil } from 'src/infrastructure/util/string.util';

@Injectable()
export class GetIndicateAndEarnHashlinkUseCase implements GetIndicateAndEarnHashlinkDomain {
  constructor(
    private readonly _indicateApiService: IndicateAndEarnService,
    private readonly _userRepository: UserRepository,
    private readonly _markintingService: MarkintingService,
  ) {}

  getLink(userId: string): GetIndicateAndEarnHashlinkIO {
    return EitherIO.from(NoUserFoundDomainError.toFn(), () => this._userRepository.getById(userId))
      .filter(NoUserFoundDomainError.toFn(), Boolean)
      .flatMap((user: UserDto) =>
        EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
          this._indicateApiService.getHashLink({
            cpf: user.cpf,
            email: user.email,
            name: user.name,
            originId: user.id,
          }),
        ).tap((url: string) =>
          this._markintingService.registerIndicateAndWin({
            email: user.email,
            firstName: StringUtil.firstName(user.name),
            lastName: StringUtil.lastName(user.name),
            url,
          }),
        ),
      );
  }
}
