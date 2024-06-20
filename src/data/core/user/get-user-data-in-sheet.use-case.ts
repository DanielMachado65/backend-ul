import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { GetUserDataInSheetDomain, GetUserDataInSheetIO } from 'src/domain/core/user/get-user-data-in-sheet.domain';
import { NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { SheetUtil } from 'src/infrastructure/util/sheet.util';

type DataUserSheetFormat = {
  readonly Nome: string;
  readonly CPF: string;
  readonly Email: string;
  readonly Telefone: string;
  readonly CEP: string;
  readonly Cidade: string;
  readonly Estado: string;
  readonly Bairro: string;
  readonly Rua: string;
  readonly Complemento: string;
  readonly Numero: string;
};

@Injectable()
export class GetUserDataInSheetUseCase implements GetUserDataInSheetDomain {
  constructor(private readonly _userRepository: UserRepository, private readonly _sheetUtil: SheetUtil) {}

  getById(userId: string): GetUserDataInSheetIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(userId))
      .filter(NoUserFoundDomainError.toFn(), Boolean)
      .map(this.convertUserToSheetJsonData.bind(this))
      .map((data: DataUserSheetFormat) => this._sheetUtil.generateBufferFromDataJson([data]));
  }

  convertUserToSheetJsonData(user: UserDto): DataUserSheetFormat {
    return {
      Nome: user.name,
      CPF: user.cpf,
      Email: user.email,
      Telefone: user.phoneNumber,
      CEP: user.address.zipCode,
      Cidade: user.address.city,
      Estado: user.address.state,
      Bairro: user.address.neighborhood,
      Rua: user.address.street,
      Complemento: user.address.complement,
      Numero: user.address.number,
    };
  }
}
