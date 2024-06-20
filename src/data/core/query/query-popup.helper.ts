import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  PopUpQuery,
  QueryRepresentationEntity,
  QueryRepresentationWithPopUpEntity,
} from 'src/domain/_entity/query-representation.entity';
import { QueryFailedService, QueryStatus } from 'src/domain/_entity/query.entity';
import { NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserEntity } from 'src/domain/_entity/user.entity';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { GreetingUtil } from 'src/infrastructure/util/greeting.util';
import { ClientType } from '../../../domain/_entity/client.entity';

interface IWidgetParams {
  readonly user: UserEntity;
  readonly query: QueryRepresentationEntity;
}

@Injectable()
export class QueryPopUpHelper {
  constructor(private readonly _userRepository: UserRepository, private readonly _greetingUtil: GreetingUtil) {}

  makePopUpQueryRepresentation(
    representation: QueryRepresentationEntity,
    clientType: ClientType,
  ): EitherIO<UnknownDomainError | NoUserFoundDomainError, QueryRepresentationWithPopUpEntity> {
    return clientType === ClientType.INTEGRATOR
      ? EitherIO.of(UnknownDomainError.toFn(), this.appendEmptyPopUpToQuery(representation))
      : EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getByQueryId(representation.id))
          .filter(NoUserFoundDomainError.toFn(), Boolean)
          .map((user: UserDto) => this.makePopupForQuery({ query: representation, user }));
  }

  appendEmptyPopUpToQuery(representation: QueryRepresentationEntity): QueryRepresentationWithPopUpEntity {
    return { ...representation, popups: [] };
  }

  makePopupForQuery(params: IWidgetParams): QueryRepresentationWithPopUpEntity {
    const { query }: IWidgetParams = params;
    if (query.status === QueryStatus.FAILURE) {
      return { ...query, popups: [this._totalFailureWidget(params)] };
    } else if (query.failedServices.length === 1) {
      return { ...query, popups: [this._oneServiceFailureWidget(params)] };
    } else if (query.failedServices.length > 1) {
      return { ...query, popups: [this._multipleServicesFailureWidget(params)] };
    } else {
      return { ...query, popups: [] };
    }
  }

  private _oneServiceFailureWidget(params: IWidgetParams): PopUpQuery {
    const header: string = this._greetingUtil.greet(params.user.name.split(/\s+/)[0] ?? '', {}) + ',';
    return {
      title: 'SERVIÇO INDISPONÍVEL',
      headerText: header,
      message:
        `O serviço ${params.query.failedServices[0].serviceName} está temporariamente fora do ar devido a falhas na fonte oficial. ` +
        `Você pode atualizar essa informação gratuitamente a qualquer momento, clicando no botão "Consultar Novamente" que fica acima dela. ` +
        'Se a indisponibilidade persistir, pedimos que aguarde alguns minutos para atualizar a consulta, ok?',
      footerText: 'Obrigado. Equipe Olho no Carro.',
      other: {},
    };
  }

  private _multipleServicesFailureWidget(params: IWidgetParams): PopUpQuery {
    const header: string = this._greetingUtil.greet(params.user.name.split(/\s+/)[0] ?? '', {}) + ',';
    const seviceNames: string = params.query.failedServices
      .map((service: QueryFailedService) => service.serviceName)
      .join(', ');

    return {
      title: 'INDISPONIBILIDADE',
      headerText: header,
      message:
        `Os serviços ${seviceNames}, estão temporariamente fora do ar devido a falhas nas fontes oficiais. ` +
        'Você pode atualizar essas informações gratuitamente a qualquer momento, clicando no botão "Consultar Novamente" que fica acima dela. ' +
        'Se a indisponibilidade persistir, pedimos que aguarde alguns minutos para atualizar a consulta, ok?',
      footerText: 'Obrigado. Equipe Olho no Carro.',
      other: {},
    };
  }

  private _totalFailureWidget(params: IWidgetParams): PopUpQuery {
    const header: string = this._greetingUtil.greet(params.user.name.split(/\s+/)[0] ?? '', {}) + ',';
    return {
      title: 'CONSULTA INDISPONÍVEL',
      headerText: header,
      message:
        `A consulta ${params.query.name} que você tentou fazer está temporariamente indisponível devido a falhas nas fontes oficiais. ` +
        'Mas, fique tranquilo! O seu saldo não foi debitado e você pode tentar refazer a sua consulta a qualquer momento. ' +
        'Se a indisponibilidade persistir, pedimos que aguarde alguns minutos para refazer a consulta, ok?',
      footerText: 'Obrigado. Equipe Olho no Carro.',
      other: {},
    };
  }
}
