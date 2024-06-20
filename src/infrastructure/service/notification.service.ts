import Transactional, { OncTemplateEnum } from '@diegomoura637/mail-sender';
import { SendEmailDto } from '@diegomoura637/mail-sender/dist/transactional/transactional.types';
import { Injectable } from '@nestjs/common';
import { AlertFineNotification } from 'src/domain/_notification/alert-fine.notification';
import { AlertFipePriceNotification } from 'src/domain/_notification/alert-fipe-price.notification';
import { AlertOnQueryMakeNotification } from 'src/domain/_notification/alert-on-query-make.notification';
import { AlertRevisionPlanNotification } from 'src/domain/_notification/alert-revision-plan.notification';
import { QueryAutoReprocessFailedNotification } from 'src/domain/_notification/query-auto-reprocess-failed.notification';
import { QueryAutoReprocessSuccessedNotification } from 'src/domain/_notification/query-auto-reprocess-successed.notification';
import { QuerySuccessNotification } from 'src/domain/_notification/query.notification';
import { UserReactiveAccesssNotification } from 'src/domain/_notification/user-reactive-access.notification';
import {
  DispatchFunc,
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
  PayloadType,
} from '../../domain/_layer/infrastructure/service/notification';
import { UserAlreadyRegisteredNotification } from '../../domain/_notification/user-already-registered.notification';
import { UserRecoverPasswordNotification } from '../../domain/_notification/user-recover-password.notification';
import { ENV_KEYS, EnvService } from '../framework/env.service';
import { ContactSupportNotification } from 'src/domain/_notification/contact-support';

type EmailParserFn = (payload: PayloadType) => Transactional;

@Injectable()
export class NotificationService extends NotificationServiceGen {
  private readonly _emailParserMap: ReadonlyMap<NotificationType, EmailParserFn>;

  constructor(private readonly _envService: EnvService) {
    super();

    this._emailParserMap = new Map<NotificationType, EmailParserFn>()
      .set(NotificationType.CONTACT_SUPPORT, this._parseEmailContactSupport.bind(this))
      .set(NotificationType.USER_ALREADY_REGISTERED, this._parseEmailUserAlreadyRegistered.bind(this))
      .set(NotificationType.USER_RECOVER_PASSWORD, this._parseEmailUserRecoverPassword.bind(this))
      .set(NotificationType.USER_REACTIVE_ACCESS, this._parseUserReactiveAccess.bind(this))
      .set(NotificationType.QUERY_AUTO_REPROCESS_SUCCESS, this._parseAutoReprocessQuerySuccessed.bind(this))
      .set(NotificationType.QUERY_AUTO_REPROCESS_FAILED, this._parseAutoReprocessQueryFailed.bind(this))
      .set(NotificationType.QUERY_SUCCESS, this._parseQuerySuccess.bind(this))
      .set(NotificationType.QUERY_FAIL, this._parseQueryFail.bind(this))
      .set(NotificationType.QUERY_ALERT, this._parseAlertOnQueryMake.bind(this))
      .set(NotificationType.QUERY_REVISION_PLAN, this._parseRevisionPlan.bind(this))
      .set(NotificationType.QUERY_FIPE_PRICE, this._parseFipePrice.bind(this))
      .set(NotificationType.QUERY_REVISION_PLAN, this._parseRevisionPlan.bind(this))
      .set(NotificationType.QUERY_FINE, this._parseFine.bind(this));
  }

  override dispatch: DispatchFunc = async (
    transport: NotificationTransport,
    id: NotificationType,
    payload: PayloadType,
  ): Promise<boolean> => {
    switch (transport) {
      case NotificationTransport.EMAIL:
        return this._dispatchEmail(id, payload);
      default:
        return false;
    }
  };

  private async _dispatchEmail(id: NotificationType, payload: PayloadType): Promise<boolean> {
    const operationResult: ReadonlyArray<SendEmailDto> = await this._getEmailOptions(id, payload).exec();
    return operationResult.every((emailResult: SendEmailDto) => emailResult.status === 'sent');
  }

  private _getEmailOptions(type: NotificationType, payload: PayloadType): Transactional {
    const emailParserFn: EmailParserFn = this._emailParserMap.get(type);
    if (!emailParserFn) throw new Error(`No email parser found for type ${type}`);
    return emailParserFn(payload);
  }

  private _getMailer(): Transactional {
    return new Transactional(
      this._envService.get(ENV_KEYS.MAILSENDER_TR_KEY),
      this._envService.get(ENV_KEYS.MAILER_DEFAULT_FROM_EMAIL),
    );
  }

  private _parseEmailContactSupport(payload: ContactSupportNotification): Transactional {
    return this._getMailer()
      .to('contato@olhonocarro.com.br')
      .template(OncTemplateEnum.SEND_CONTACT_TEMPLATE_EMAIL)
      .subject('🔑🔒Olho no Carro - Contato através do Site')
      .margeVars([
        {
          name: 'NAME',
          content: payload.name,
        },
        {
          name: 'EMAIL',
          content: payload.email,
        },
        {
          name: 'PHONE',
          content: payload.phone,
        },
        {
          name: 'MESSAGE',
          content: payload.message,
        },
      ]);
  }

  private _parseEmailUserAlreadyRegistered(payload: UserAlreadyRegisteredNotification): Transactional {
    return this._getMailer()
      .to(payload.email)
      .template('OnUserTryRegisterAppError' as OncTemplateEnum)
      .subject(`${payload.name}, você não precisa realizar um novo cadastro para acessar nosso APP - Olho no Carro`)
      .margeVars([
        {
          name: 'USERNAME',
          content: payload.name,
        },
        {
          name: 'LINK',
          content: payload.urlToRedirect,
        },
      ]);
  }

  private _parseEmailUserRecoverPassword(payload: UserRecoverPasswordNotification): Transactional {
    return this._getMailer()
      .to(payload.email)
      .template(OncTemplateEnum.RECOVERY_PASSWORD)
      .subject(`🔑🔒 Olá ${payload.name}! Siga com a recuperação de senha - #Olhonocarro`)
      .margeVars([
        {
          name: 'USERNAME',
          content: payload.name,
        },
        {
          name: 'LINK',
          content: payload.urlToRedirect,
        },
      ]);
  }

  private _parseUserReactiveAccess(payload: UserReactiveAccesssNotification): Transactional {
    return this._getMailer()
      .to(payload.email)
      .template(OncTemplateEnum.REACTIVE_ACCESS)
      .subject('Cadastre uma nova senha e reative seu acesso!')
      .margeVars([
        {
          name: 'USERNAME',
          content: payload.name,
        },
        {
          name: 'LINK',
          content: payload.urlToRedirect,
        },
      ]);
  }

  private _parseAutoReprocessQuerySuccessed(payload: QueryAutoReprocessSuccessedNotification): Transactional {
    const baseUrl: string = this._envService.get('WEB_SITE_BASE_URL');
    const queryResultUrl: string = `${baseUrl}/resultado-da-consulta/?queryCode=${payload.queryCode}&queryId=${payload.queryId}`;

    return this._getMailer()
      .to(payload.email)
      .template('reprocessing_succes' as OncTemplateEnum)
      .subject('Sua consulta foi reprocessada! - #Olhonocarro')
      .margeVars([
        {
          name: 'FNAME',
          content: payload.name,
        },
        {
          name: 'LINK',
          content: queryResultUrl,
        },
      ]);
  }

  private _parseAutoReprocessQueryFailed(payload: QueryAutoReprocessFailedNotification): Transactional {
    const baseUrl: string = this._envService.get('WEB_SITE_BASE_URL');
    const queryResultUrl: string = `${baseUrl}/resultado-da-consulta/?queryCode=${payload.queryCode}&queryId=${payload.queryId}`;

    return this._getMailer()
      .to(payload.email)
      .template('reprocessing_fail' as OncTemplateEnum)
      .subject('Não conseguimos reprocessar sua consulta! - #Olhonocarro')
      .margeVars([
        {
          name: 'FNAME',
          content: payload.name,
        },
        {
          name: 'LINK',
          content: queryResultUrl,
        },
      ]);
  }

  private _parseQuerySuccess(payload: QuerySuccessNotification): Transactional {
    const baseUrl: string = this._envService.get('WEB_SITE_BASE_URL');
    const queryResultUrl: string = `${baseUrl}/resultado-da-consulta/?queryCode=${payload.queryCode}&queryId=${payload.queryId}`;

    return this._getMailer()
      .to(payload.email)
      .template('OnQueryDone' as OncTemplateEnum)
      .subject('Sua consulta terminou! - #Olhonocarro')
      .margeVars([
        {
          name: 'FNAME',
          content: payload.name,
        },
        {
          name: 'QUERYNAME',
          content: payload.queryName,
        },
        {
          name: 'LINK',
          content: queryResultUrl,
        },
      ]);
  }
  private _parseQueryFail(payload: QuerySuccessNotification): Transactional {
    return this._getMailer()
      .to(payload.email)
      .template('OnQueryFailed' as OncTemplateEnum)
      .subject('Sua consulta falhou! - #Olhonocarro')
      .margeVars([
        {
          name: 'FNAME',
          content: payload.name,
        },
        {
          name: 'QUERYNAME',
          content: payload.queryName,
        },
      ]);
  }

  private _parseAlertOnQueryMake(payload: AlertOnQueryMakeNotification): Transactional {
    return this._getMailer()
      .to(payload.email)
      .template('template-alerta-de-consulta' as OncTemplateEnum)
      .subject('Foi feita uma consulta do seu carro! - #Olhonocarro')
      .margeVars([
        {
          name: 'FNAME',
          content: payload.name?.split(' ')[0],
        },
        {
          name: 'PLATE',
          content: payload.plate,
        },
      ]);
  }

  private _parseRevisionPlan(payload: AlertRevisionPlanNotification): Transactional {
    return this._getMailer()
      .to(payload.email)
      .template('template-alerta-revisao' as OncTemplateEnum)
      .subject('Alerta de revisão para seu carro! - #Olhonocarro')
      .margeVars([
        {
          name: 'FNAME',
          content: payload.name?.split(' ')[0],
        },
        {
          name: 'PLATE',
          content: payload.plate,
        },
        {
          name: 'DATE',
          content: payload.date,
        },
        {
          name: 'PRICE',
          content: payload.price,
        },
      ]);
  }

  private _parseFipePrice(payload: AlertFipePriceNotification): Transactional {
    return this._getMailer()
      .to(payload.email)
      .template('template-alerta-tabela-fipe' as OncTemplateEnum)
      .subject('Alerta de preço fipe para seu carro! - #Olhonocarro')
      .margeVars([
        {
          name: 'FNAME',
          content: payload.name?.split(' ')[0],
        },
        {
          name: 'PLATE',
          content: payload.plate,
        },
        {
          name: 'OLD_VALUE',
          content: payload.oldPrice,
        },
        {
          name: 'CURRENT_VALUE',
          content: payload.currentPrice,
        },
      ]);
  }

  private _parseFine(payload: AlertFineNotification): Transactional {
    return this._getMailer()
      .to(payload.email)
      .template('template-alerta-multa' as OncTemplateEnum)
      .subject('Alerta de multas para seu carro! - #Olhonocarro')
      .margeVars([
        {
          name: 'FNAME',
          content: payload.name?.split(' ')[0],
        },
        {
          name: 'PLATE',
          content: payload.plate,
        },
        {
          name: 'DESCRIPTION',
          content: payload.description,
        },
        {
          name: 'PRICE',
          content: payload.price,
        },
      ]);
  }
}
