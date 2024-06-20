import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { CarRevendorEntity } from 'src/domain/_entity/car-revendor.entity';

import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { ChannelType } from 'src/domain/_entity/user-consents.entity';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { CarRevendorRepository } from 'src/domain/_layer/infrastructure/repository/car-revendor.repository';
import { AutomateData, AutomateEnum, AutomateService } from 'src/domain/_layer/infrastructure/service/automate.service';
import { ConsentsService } from 'src/domain/_layer/infrastructure/service/user-consents.service';
import { AutomateUserDomain, AutomateUserIO } from 'src/domain/core/user/automate-user.domain';

@Injectable()
export class AutomateUserUseCase implements AutomateUserDomain {
  constructor(
    private readonly _automateService: AutomateService,
    private readonly _userConsentService: ConsentsService,
    private readonly _carVendorRepository: CarRevendorRepository,
  ) {}

  execute(user: UserDto): AutomateUserIO {
    return EitherIO.of(UnknownDomainError.toFn(), user)
      .map(this._parseUserData())
      .tap(this._dispathUserData())
      .map(() => null);
  }

  private _parseUserData() {
    return async (user: UserDto): Promise<AutomateData> => {
      const isGivenConsentWhatsapp: boolean = await this._userConsentService.isGivenConsent(
        user.id,
        ChannelType.WHATSAPP,
      );
      const carRevendor: CarRevendorEntity = await this._carVendorRepository.getById(user.id);

      return {
        dadosUsuario: {
          id: user.id,
          nome: user.name,
          email: user.email,
          telefone: user.phoneNumber,
          cidade: user.address.city,
          uf: user.address.state,
          bairro: user.address.neighborhood,
          rua: user.address.street,
          numero: user.address.number,
          origemCriacao: user.creationOrigin,
          consentimetoWhatsapp: isGivenConsentWhatsapp ? 'SIM' : 'NAO',
          revendedorDeCarro: carRevendor?.status ? 'SIM' : 'NAO',
        },
      };
    };
  }

  private _dispathUserData() {
    return async (data: AutomateData): Promise<void> => {
      await this._automateService.dispatch(AutomateEnum.USER_CREATED, data);
    };
  }
}
