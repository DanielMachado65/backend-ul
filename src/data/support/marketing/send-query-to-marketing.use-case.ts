import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { NoQueryFoundDomainError, NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { DebitsData, ProviderVehicleData } from 'src/domain/_layer/data/dto/get-provider-data.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { MarkintingService } from 'src/domain/_layer/infrastructure/service/marketing.service';
import {
  SendQueryToMarketingDomain,
  SendQueryToMarketingIO,
} from 'src/domain/support/marketing/send-query-to-marketing.domain';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';

type QueryWithUser = readonly [QueryDto, UserDto];

@Injectable()
export class SendQueryToMarketingUseCase implements SendQueryToMarketingDomain {
  constructor(
    private readonly _queryRepository: QueryRepository,
    private readonly _userRepository: UserRepository,
    private readonly _markintingService: MarkintingService,
    private readonly _currencyUtil: CurrencyUtil,
  ) {}

  send(queryId: string): SendQueryToMarketingIO {
    return EitherIO.of(UnknownDomainError.toFn(), queryId)
      .flatMap(this._getQueryWithUser.bind(this))
      .map(([query, user]: QueryWithUser) => this._saveMarketingQuery(query.responseJson, user))
      .map(() => true);
  }

  private _getQueryWithUser(queryId: string): EitherIO<UnknownDomainError, QueryWithUser> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._queryRepository.getById(queryId))
      .filter(NoQueryFoundDomainError.toFn(), Boolean)
      .flatMap((query: QueryDto) =>
        EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(query.userId))
          .filter(NoUserFoundDomainError.toFn(), Boolean)
          .map((user: UserDto) => [query, user]),
      );
  }

  private async _saveMarketingQuery(responseJson: ProviderVehicleData, user: UserDto): Promise<void> {
    if (typeof responseJson !== 'object' || !responseJson) return;

    const hasDebts: boolean = responseJson && responseJson.debitosMultas && !responseJson.debitosMultas.noDebts;

    const registerQueryPromise: Promise<void> = this._markintingService.registerQuery({
      email: user?.email,
      fullName: user?.name,
      birthday: user?.createdAt,
      phoneNumber: user?.phoneNumber,
      plate: responseJson.placa as string,
      brand: responseJson.marca as string,
      model: responseJson.modelo as string,
    });

    if (hasDebts) {
      const debits: ReadonlyArray<DebitsData> = responseJson.debitosMultas?.debitos || [];
      const totalAmountInCents: number = debits
        .map((debits: DebitsData) => debits.valorTotalEmCentavos)
        .reduce((acc: number, curr: number) => acc + curr, 0);

      if (totalAmountInCents > 0) {
        const totalAmountFormated: string = this._currencyUtil
          .numToCurrency(totalAmountInCents, 2)
          .toFloat()
          .toString();

        const registerIsHasDabits: Promise<void> = this._markintingService.registerIsHasDabits({
          email: user.email,
          fullName: user.name,
          birthday: user.createdAt,
          plate: responseJson.placa as string,
          brand: responseJson.marca as string,
          model: responseJson.modelo as string,
          totalDebits: totalAmountFormated,
          renavam: responseJson.renavam as string,
        });

        await Promise.allSettled([registerIsHasDabits, registerQueryPromise]);
      }
    } else {
      await registerQueryPromise;
    }
  }
}
