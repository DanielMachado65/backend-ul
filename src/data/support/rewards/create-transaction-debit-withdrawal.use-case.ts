import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { IndicateAndEarnService } from 'src/domain/_layer/infrastructure/service/indicate-and-earn.service';
import { TransactionDebitWithdrawalBodyInputDto } from 'src/domain/_layer/presentation/dto/transaction-debit-withdrawal-input.dto';
import {
  CreateTransactionDebitsWithdrawalDomain,
  CreateTransactionDebitWithdrawalIO,
} from 'src/domain/support/rewards/create-transaction-debit-withdrawal.domain';
import { ParsedPixKey, PixKeyParserHelper } from './pix-key-parser-helper';
import {
  TransactionDebitWithdrawal,
  TransactionDebtsStatus,
  TransactionDebtsType,
} from 'src/domain/_layer/data/dto/transaction-debit-withdrawal.dto';

@Injectable()
export class CreateTransactionDebitWithdrawalUseCase implements CreateTransactionDebitsWithdrawalDomain {
  constructor(
    private readonly _pixKeyParserHelper: PixKeyParserHelper,
    private readonly _userRepository: UserRepository,
    private readonly _indicateAndEarn: IndicateAndEarnService,
  ) {}

  create(userId: string, body: TransactionDebitWithdrawalBodyInputDto): CreateTransactionDebitWithdrawalIO {
    return EitherIO.from(UnknownDomainError.toFn(), this._fetchUser(userId))
      .filter(NoUserFoundDomainError.toFn(), (user: UserDto) => !!user)
      .map((user: UserDto) => this._processTransaction(user, body));
  }

  private _fetchUser(userId: string) {
    return async (): Promise<UserDto> => {
      return await this._userRepository.getById(userId);
    };
  }

  private async _processTransaction(
    user: UserDto,
    { pixType, pixKey, valueInCents }: TransactionDebitWithdrawalBodyInputDto,
  ): Promise<TransactionDebitWithdrawal> {
    const { pixKeyType, pixKeyValue }: ParsedPixKey = this._pixKeyParserHelper.parsePix(pixType, pixKey);

    const isCompleted: boolean = await this._indicateAndEarn
      .addTransactionDebitWithdrawal({
        cpf: user.cpf,
        email: user.email,
        name: user.name,
        originId: user.id,
        pixKeyType,
        pixKey: pixKeyValue,
        value: Number(valueInCents),
      })
      .catch(() => false);

    if (!isCompleted) {
      throw new ProviderUnavailableDomainError();
    }

    return {
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: TransactionDebtsStatus.CRIADA,
      valueInCents: valueInCents,
      type: TransactionDebtsType.DEBIT_WITHDRAWAL,
      id: null,
      indicatedCpf: user.cpf,
      indicatedEmail: user.email,
      indicatedId: user.id,
      indicatedName: user.name,
      originValue: valueInCents,
      participantId: user.id,
    };
  }
}
