import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { CarRevendorEntity } from 'src/domain/_entity/car-revendor.entity';

import { NotGuvenConsentDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { ChannelType } from 'src/domain/_entity/user-consents.entity';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { CarRevendorRepository } from 'src/domain/_layer/infrastructure/repository/car-revendor.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { AutomateData, AutomateEnum, AutomateService } from 'src/domain/_layer/infrastructure/service/automate.service';
import { ConsentsService } from 'src/domain/_layer/infrastructure/service/user-consents.service';
import { AutomateQueryDomain, AutomateQueryIO } from 'src/domain/core/query/automate-query.domain';
import { QueryAuctionVo } from 'src/domain/value-object/query/query-auction.vo';
import { QueryBasicVehicleDataVo } from 'src/domain/value-object/query/query-basic-vehicle.vo';
import { QueryDebtsAndFinesVo } from 'src/domain/value-object/query/query-debts-and-fines.vo';
import { QueryStateBaseVo } from 'src/domain/value-object/query/query-state-base.vo';

type Restriction = { temRestricoes: string; restricoes: string[] };

@Injectable()
export class AutomateQueryUseCase implements AutomateQueryDomain {
  constructor(
    private readonly _automateService: AutomateService,
    private readonly _userRepository: UserRepository,
    private readonly _consentsService: ConsentsService,
    private readonly _userConsentService: ConsentsService,
    private readonly _carVendorRepository: CarRevendorRepository,
  ) {}

  saveResponseQuery(queryDto: QueryDto): AutomateQueryIO {
    return EitherIO.of(UnknownDomainError.toFn(), queryDto)
      .filter(NotGuvenConsentDomainError.toFn(), this._checkUserConsent())
      .map(this._getUser())
      .map(this._parseData(queryDto))
      .map(this._dispatchQueryData());
  }

  private _checkUserConsent() {
    return async (queryDto: QueryDto): Promise<boolean> => {
      return this._consentsService.isGivenConsent(queryDto.userId, ChannelType.WHATSAPP);
    };
  }

  private _getUser() {
    return (query: QueryDto): Promise<UserDto> => {
      return this._userRepository.getById(query.userId);
    };
  }

  private _parseData({ id, refClass, responseJson, queryCode, documentType, documentQuery }: QueryDto) {
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
        dadosConsulta:
          queryCode === 27
            ? {
                id: id,
                tipoChaveDeBusca: documentType,
                chaveDeBusca: documentQuery,
                nomeConsulta: refClass,
              }
            : queryCode === 100 || queryCode === 30
            ? {
                id: id,
                tipoChaveDeBusca: documentType,
                chaveDeBusca: documentQuery,
                nomeConsulta: refClass,
                marcaModelo: responseJson?.marca && this._getModelbrand(responseJson),
                anoModelo: responseJson?.anoModelo && responseJson.anoModelo,
                temDebitos:
                  responseJson?.debitosMultas && this._hasDebts(responseJson.debitosMultas as QueryDebtsAndFinesVo),
                fipe:
                  responseJson?.dadosBasicosDoVeiculo &&
                  this._getFipe(responseJson.dadosBasicosDoVeiculo as QueryBasicVehicleDataVo),
                ...this._getAuction(responseJson.leilao as QueryAuctionVo),
                ...this._getRestriction(
                  responseJson.baseEstadual as QueryStateBaseVo,
                  responseJson.baseNacional as QueryStateBaseVo,
                ),
              }
            : {
                id: id,
                tipoChaveDeBusca: documentType,
                chaveDeBusca: documentQuery,
                nomeConsulta: refClass,
                marcaModelo: responseJson?.marca && this._getModelbrand(responseJson),
                anoModelo: responseJson?.anoModelo && responseJson.anoModelo,
              },
      };
    };
  }

  private _getModelbrand(responseJson: Record<string, unknown>): string {
    const modelBrand: string = (responseJson.marcaModelo ||
      `${responseJson.marca}/${responseJson.modelo}` ||
      '-') as string;

    return modelBrand;
  }

  private _hasDebts(debitosMultas: QueryDebtsAndFinesVo): string {
    const hasDebts: boolean = debitosMultas && !debitosMultas.noDebts;
    return hasDebts ? 'SIM' : 'NÃO';
  }

  private _getFipe(dadosBasicosDoVeiculo: QueryBasicVehicleDataVo): string {
    return dadosBasicosDoVeiculo &&
      dadosBasicosDoVeiculo.informacoesFipe &&
      dadosBasicosDoVeiculo.informacoesFipe.length > 0
      ? dadosBasicosDoVeiculo.informacoesFipe[0].fipeId
      : '-';
  }

  private _getAuction(leilao: QueryAuctionVo): { temLeilao: string; scoreLeilao: string } {
    return {
      temLeilao: leilao && Array.isArray(leilao.registros) && leilao.registros.length > 0 ? 'SIM' : 'NÃO',
      scoreLeilao: leilao && leilao.score && leilao.score.score ? leilao.score.score : '-',
    };
  }

  private _getRestriction(baseEstadual: QueryStateBaseVo, baseNacional: QueryStateBaseVo): Restriction {
    const restrictions: string[] = [
      baseEstadual.restricaoTributaria,
      baseEstadual.restricaoRouboFurto,
      baseEstadual.restricaoRenajud,
      baseEstadual.restricaoNomeAgente,
      baseEstadual.restricaoJudicial,
      baseEstadual.restricaoGuincho,
      baseEstadual.restricaoFinanceira,
      baseEstadual.restricaoDocArrendatario,
      baseEstadual.restricaoDataInclusao,
      baseEstadual.restricaoArrendatario,
      baseEstadual.restricaoAmbiental,
      baseEstadual.restricaoAdminisrativa,
      baseNacional.restricaoTributaria,
      baseNacional.restricaoRouboFurto,
      baseNacional.restricaoRenajud,
      baseNacional.restricaoNomeAgente,
      baseNacional.restricaoJudicial,
      baseNacional.restricaoGuincho,
      baseNacional.outrasRestricoes1,
      baseNacional.outrasRestricoes2,
      baseNacional.outrasRestricoes3,
      baseNacional.outrasRestricoes4,
    ]
      .filter((item: string) => typeof item === 'string')
      .filter((item: string) => item !== 'NADA CONSTA');

    return {
      temRestricoes: restrictions.length > 0 ? 'SIM' : 'NÃO',
      restricoes: restrictions,
    };
  }

  private _dispatchQueryData() {
    return async (data: AutomateData): Promise<void> => {
      await this._automateService.dispatch(AutomateEnum.QUERY_DATA, data);
      return null;
    };
  }
}
