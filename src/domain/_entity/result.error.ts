import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  Type,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export interface IStringify {
  readonly toString: () => string;
}

export type ErrorLevel = 'log' | 'error' | 'warning' | 'debug' | 'none';

export type IDomainErrorDetail = Record<string, unknown> & IStringify;

const defaultDomainErrorDetail: IDomainErrorDetail = { toString: (): string => '' };

export class CouponMinValueNotReachedDomainErrorDetails {
  @ApiProperty()
  readonly couponId: string;

  @ApiProperty()
  readonly couponCode: string;

  @ApiProperty()
  readonly realPriceInCents: number;

  @ApiProperty()
  readonly minValueToApplyInCents: number;
}

export class QueryDuplicatedDomainErrorDetails {
  @ApiProperty()
  readonly queryId: string;

  @ApiProperty()
  readonly code: number;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly createdAt: string;
}

export class CantProcessPaymentDomainErrorDetails {
  @ApiProperty()
  readonly message: string;
}

export abstract class DomainError {
  @ApiProperty()
  readonly tag: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly details?: IDomainErrorDetail;

  @ApiProperty()
  readonly errorLevel: ErrorLevel = 'error';

  readonly internalDetails?: IDomainErrorDetail;
}

export class SentryDomainError extends Error implements DomainError {
  readonly tag: string;
  readonly description: string;
  readonly details?: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel;
  readonly internalDetails?: IDomainErrorDetail;

  constructor(domainError: DomainError) {
    super();

    this.tag = domainError.tag;
    this.description = domainError.description;
    this.details = domainError.details;
    this.errorLevel = domainError.errorLevel;
    this.internalDetails = domainError.internalDetails;

    this.name = domainError.tag;
    this.message = domainError.description;
    this.stack = domainError.internalDetails.stackTrace as string;
  }
}

export interface IRequestError {
  readonly statusCode: number;
  readonly startTime: string;
  readonly endTime: string;
  readonly processingTime: string;
  readonly path: string;
  readonly tag: string;
  readonly description: string;
  readonly details?: Record<string, unknown>;
  readonly internalDetails?: Record<string, unknown>;
  readonly requestId?: string;
  readonly errorId?: string;
}

export function isDomainError(value: unknown): value is DomainError {
  const maybeDomainError: DomainError = value as DomainError;
  return maybeDomainError && typeof maybeDomainError === 'object' && typeof maybeDomainError.tag === 'string';
}

export function cleanUpDomainError(domainError: DomainError): DomainError {
  const value: DomainError = {
    tag: domainError.tag,
    description: domainError.description,
    details: domainError.details,
    internalDetails: domainError.internalDetails,
    errorLevel: domainError.errorLevel,
  };
  return Object.keys(value).reduce((acc: Record<string, unknown>, key: string) => {
    if (!!value[key]) return { ...acc, [key]: value[key] };
    return acc;
  }, {}) as unknown as DomainError;
}

function makeToFn<Value extends DomainError & HttpException>(
  value: Type<Value>,
  details: IDomainErrorDetail = undefined,
): (error?: unknown) => Value {
  /** Stacktrace */
  const stackTrace: string = new Error().stack;
  const stackTraceLines: ReadonlyArray<string> = stackTrace.split(/\n {4}/g);
  // eslint-disable-next-line functional/prefer-readonly-type
  const stackTraceLinesFiltered: Array<string> = stackTraceLines.filter(
    (line: string) => !line.match(/result.error.[tj]s/),
  ); // removes the lines from this file
  const stackTraceFiltered: string = stackTraceLinesFiltered.join('\n    ');

  return (rawError?: unknown): Value => {
    const error: Record<string, unknown> =
      rawError instanceof Error
        ? {
            name: rawError.name,
            message: rawError.message,
            stackTrace: rawError.stack,
          }
        : typeof rawError === 'string'
        ? {
            name: 'None',
            message: rawError,
            stackTrace: stackTraceFiltered,
          }
        : {
            name: 'Unknown',
            message: 'unknown error',
            stackTrace: stackTraceFiltered,
          };
    const internalDetails: IDomainErrorDetail = { ...error, toString: () => JSON.stringify(error) };
    return new value(details, internalDetails);
  };
}

export class UnknownDomainError extends InternalServerErrorException implements DomainError {
  readonly tag: string = 'UNKNOWN_ERROR';
  readonly description: string = 'Erro desconhecido. Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => UnknownDomainError {
    return makeToFn(UnknownDomainError);
  }
}

export class CantIssueInvoiceDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'CANT_ISSUE_INVOICE';
  readonly description: string =
    'Não foi possível emitir a sua nota fiscal! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => CantIssueInvoiceDomainError {
    return makeToFn(CantIssueInvoiceDomainError);
  }
}

export class NoBalanceFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_BALANCE_FOUND';
  readonly description: string = 'Saldo não encontrado! Por favor, entre em contato com o suporte. ';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoBalanceFoundDomainError {
    return makeToFn(NoBalanceFoundDomainError);
  }
}

export class NoConsumptionFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_CONSUMPTION_FOUND';
  readonly description: string = 'As informações de consumo não foram encontradas!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoConsumptionFoundDomainError {
    return makeToFn(NoConsumptionFoundDomainError);
  }
}

export class NoPaymentFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_PAYMENT_FOUND';
  readonly description: string = 'Pagamento não encontrado! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoPaymentFoundDomainError {
    return makeToFn(NoPaymentFoundDomainError);
  }
}

export class InvalidPaymentStateForOperationDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'INVALID_PAYMENT_STATE_FOR_OPERATION';
  readonly description: string = 'Pagamento inválido! Por favor, tente de novo ou entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => InvalidPaymentStateForOperationDomainError {
    return makeToFn(InvalidPaymentStateForOperationDomainError);
  }
}

export class NfeAlreadyCreatedDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'NFE_ALREADY_CREATED';
  readonly description: string = 'Uma nota fiscal já foi criada para este pagamento!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NfeAlreadyCreatedDomainError {
    return makeToFn(NfeAlreadyCreatedDomainError);
  }
}

export class NoCreditsAddedDomainError extends InternalServerErrorException implements DomainError {
  readonly tag: string = 'NO_CREDITS_ADDED';
  readonly description: string = 'Houve um erro interno e não foi possível adicionar os créditos na conta!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoCreditsAddedDomainError {
    return makeToFn(NoCreditsAddedDomainError);
  }
}

export class CreditsAlreadyAddedDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'CREDITS_ALREADY_ADDED';
  readonly description: string = 'Já adicionamos os créditos deste pagamento na sua conta!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => CreditsAlreadyAddedDomainError {
    return makeToFn(CreditsAlreadyAddedDomainError);
  }
}

export class NoPriceTableFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_PRICE_TABLE_FOUND';
  readonly description: string = 'Tabela de preço não encontrada! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoPriceTableFoundDomainError {
    return makeToFn(NoPriceTableFoundDomainError);
  }
}

export class NoProductFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_PRODUCT_FOUND';
  readonly description: string = 'Produto não encontrado! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoProductFoundDomainError {
    return makeToFn(NoProductFoundDomainError);
  }
}

export class NoQueryFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_QUERY_FOUND';
  readonly description: string = 'Consulta não encontrada! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoQueryFoundDomainError {
    return makeToFn(NoQueryFoundDomainError);
  }
}

export class NoServiceFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_SERVICE_FOUND';
  readonly description: string = 'Serviço não encontrado! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoServiceFoundDomainError {
    return makeToFn(NoServiceFoundDomainError);
  }
}

export class NoServiceLogFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_SERVICE_LOG_FOUND';
  readonly description: string =
    'Registro de log de serviço não encontrado! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoServiceLogFoundDomainError {
    return makeToFn(NoServiceLogFoundDomainError);
  }
}

export class NoBillingFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_BILLING_FOUND';
  readonly description: string =
    'Dados de cobrança do usuário não encontrados! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoBillingFoundDomainError {
    return makeToFn(NoBillingFoundDomainError);
  }
}

export class NoUserFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_USER_FOUND';
  readonly description: string = 'Usuário não encontrado! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoUserFoundDomainError {
    return makeToFn(NoUserFoundDomainError);
  }
}

export class UserDisabledDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'USER_DISABLED';
  readonly description: string = 'Usuário desativado! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => UserDisabledDomainError {
    return makeToFn(UserDisabledDomainError);
  }
}

export class UserHasWeakPasswordDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'USER_HAS_WEAK_PASSWORD';
  readonly description: string = `A senha fornecida não é forte o suficiente. Por favor, certifique-se de que sua senha: 
      - Tem pelo menos 8 caracteres
      - Contém uma combinação de letras maiúsculas e minúsculas
      - Inclui números e símbolos`;

  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => UserHasWeakPasswordDomainError {
    return makeToFn(UserHasWeakPasswordDomainError);
  }
}

export class NoCouponFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_COUPON_FOUND';
  readonly description: string = 'Ops! Não encontramos este cupom.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoCouponFoundDomainError {
    return makeToFn(NoCouponFoundDomainError);
  }
}

export class NoPackageFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_PACKAGE_FOUND';
  readonly description: string = 'Pacote não encontrado! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoPackageFoundDomainError {
    return makeToFn(NoPackageFoundDomainError);
  }
}

export class NoSubscriptionFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_SUBSCRIPTION_FOUND';
  readonly description: string = 'Assinatura não encontrada! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoSubscriptionFoundDomainError {
    return makeToFn(NoSubscriptionFoundDomainError);
  }
}

export class SubscriptionInvalidStateDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'SUBSCRIPTION_INVALID_STATE_FOUND';
  readonly description: string = 'Operação invalida na assinatura! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => SubscriptionInvalidStateDomainError {
    return makeToFn(SubscriptionInvalidStateDomainError);
  }
}

export class MyCarInvalidStateDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'MY_CAR_INVALID_STATE_FOUND';
  readonly description: string = 'Operação invalida na assinatura! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => MyCarInvalidStateDomainError {
    return makeToFn(MyCarInvalidStateDomainError);
  }
}

export class CouponLimitForUserReachedDomainError extends UnauthorizedException implements DomainError {
  readonly tag: string = 'COUPON_LIMIT_FOR_USER';
  readonly description: string = 'Você atingiu o limite máximo de uso do cupom por usuário!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => CouponLimitForUserReachedDomainError {
    return makeToFn(CouponLimitForUserReachedDomainError);
  }
}

export class CouponMinValueNotReachedDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'COUPON_MIN_VALUE_NOT_REACHED';
  readonly description: string = 'O valor mínimo para utilização do cupom não foi atingido!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(
    details: CouponMinValueNotReachedDomainErrorDetails,
  ): (_error?: unknown) => CouponMinValueNotReachedDomainError {
    return makeToFn(CouponMinValueNotReachedDomainError, {
      ...details,
      toString: (): string => JSON.stringify(details),
    });
  }
}

export class CouponExpiredDomainError extends UnauthorizedException implements DomainError {
  readonly tag: string = 'COUPON_EXPIRED';
  readonly description: string = 'Ops! Este cupom já expirou ou você já atingiu o limite máximo de uso.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => CouponExpiredDomainError {
    return makeToFn(CouponExpiredDomainError);
  }
}

export class NoEventMatchingFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NO_EVENT_MATCHING_FOUND';
  readonly description: string = 'Nenhuma correspondência de evento encontrada!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoEventMatchingFoundDomainError {
    return makeToFn(NoEventMatchingFoundDomainError);
  }
}

export class InactiveBillingDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'INACTIVE_BILLING';
  readonly description: string = 'Faturamento inativo! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => InactiveBillingDomainError {
    return makeToFn(InactiveBillingDomainError);
  }
}

export class InsufficientCreditsDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'INSUFFICIENT_CREDITS';
  readonly description: string = 'Créditos insuficientes! Por favor, adicione mais créditos para consultar.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => InsufficientCreditsDomainError {
    return makeToFn(InsufficientCreditsDomainError);
  }
}

export class InvalidKeysForProductDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'INVALID_KEYS_FOR_PRODUCT';
  readonly description: string = 'Chave de busca inválida! Por favor, tente de novo.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => InvalidKeysForProductDomainError {
    return makeToFn(InvalidKeysForProductDomainError);
  }
}

export class ProductUnavailableToUserDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'PRODUCT_UNAVAILABLE_TO_USER';
  readonly description: string = 'Produto indisponível! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => ProductUnavailableToUserDomainError {
    return makeToFn(ProductUnavailableToUserDomainError);
  }
}

export class ProviderUnavailableDomainError extends ServiceUnavailableException implements DomainError {
  readonly tag: string = 'PROVIDER_UNAVAILABLE';
  readonly description: string =
    'Ops! Parece que este serviço está fora do ar. Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'warning';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (error?: unknown) => ProviderUnavailableDomainError {
    return makeToFn(ProviderUnavailableDomainError);
  }

  static toFnService(service: string): (_error?: unknown) => ProviderUnavailableDomainError {
    return makeToFn(ProviderUnavailableDomainError, { service });
  }
}

export class QueryDuplicatedDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'QUERY_DUPLICATED';
  readonly description: string = 'Consulta duplicada!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(details: QueryDuplicatedDomainErrorDetails): (_error?: unknown) => QueryDuplicatedDomainError {
    return makeToFn(QueryDuplicatedDomainError, { ...details, toString: (): string => JSON.stringify(details) });
  }
}

export class LegacyQueryDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'LEGACY_QUERY';
  readonly description: string = 'Chamada para API legada retornou erro!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => LegacyQueryDomainError {
    return makeToFn(LegacyQueryDomainError);
  }
}

export class TooManyServiceLogReprocessDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'TOO_MANY_SERVICE_LOG_REPROCESS';
  readonly description: string = 'Muitas tentativas de reprocessar o log de serviço!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => TooManyServiceLogReprocessDomainError {
    return makeToFn(TooManyServiceLogReprocessDomainError);
  }
}

export class ServiceLogAlreadyReprocessingDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'SERVICE_LOG_ALREADY_REPROCESSING';
  readonly description: string = 'O Log de serviço já está sendo processado!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => ServiceLogAlreadyReprocessingDomainError {
    return makeToFn(ServiceLogAlreadyReprocessingDomainError);
  }
}

export class InvalidCredentialsDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'INVALID_CREDENTIALS';
  readonly description: string = 'Não foi possível fazer o login! Por favor, verifique os dados e tente  de novo.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => InvalidCredentialsDomainError {
    return makeToFn(InvalidCredentialsDomainError);
  }
}

export class TokenExpiredDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'TOKEN_EXPIRED';
  readonly description: string = 'O tempo do seu token experiou! Por favor refaça a solicitação';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => TokenExpiredDomainError {
    return makeToFn(TokenExpiredDomainError);
  }
}

export class MyCarAlreadyExistsDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'MY_CAR_ALREADY_EXISTS';
  readonly description: string = 'Já existe mais de um carro criado para esse usuário!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => MyCarAlreadyExistsDomainError {
    return makeToFn(MyCarAlreadyExistsDomainError);
  }
}

export class MyCarIsAlreadyRegisteredDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'MY_CAR_IS_ALREADY_REGISTERED';
  readonly description: string = 'Já foi cadastrado esse carro para esse usuário!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => MyCarIsAlreadyRegisteredDomainError {
    return makeToFn(MyCarIsAlreadyRegisteredDomainError);
  }
}

export class FirstFreeMyCarIsAvailableDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'FIRST_FREE_MY_CAR_IS_AVAILABLE';
  readonly description: string = 'Não passe o cartão no primeiro cadastro no Meus Carros';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => FirstFreeMyCarIsAvailableDomainError {
    return makeToFn(FirstFreeMyCarIsAvailableDomainError);
  }
}

export class NotFoundMyCarDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'MY_CAR_NO_FOUND';
  readonly description: string = 'Não foi encontrado nenhum carro para esse usuário!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NotFoundMyCarDomainError {
    return makeToFn(NotFoundMyCarDomainError);
  }
}

export class UserAlreadyExistsDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'USER_ALREADY_EXISTS';
  readonly description: string = 'Já existe um usuário criado com o e-mail ou CPF informado!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => UserAlreadyExistsDomainError {
    return makeToFn(UserAlreadyExistsDomainError);
  }
}

export class EmailAlreadyInUseByAnotherUserDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'EMAIL_ALREADY_IN_USE_BY_ANOTHER_USER';
  readonly description: string = 'Este e-mail já está cadastrado em outra conta!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => EmailAlreadyInUseByAnotherUserDomainError {
    return makeToFn(EmailAlreadyInUseByAnotherUserDomainError);
  }
}

export class UserAlreadyBoughtDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'USER_ALREADY_BOUGHT';
  readonly description: string = 'Esta compra já foi realizada!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => UserAlreadyBoughtDomainError {
    return makeToFn(UserAlreadyBoughtDomainError);
  }
}

export class OwnerReviewNotProcess extends BadRequestException implements DomainError {
  readonly tag: string = 'OWNER_REVIEW_NOT_PROCESS';
  readonly description: string = 'Avaliação do proprietário não processada!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => OwnerReviewNotProcess {
    return makeToFn(OwnerReviewNotProcess);
  }
}

export class NotificationUpdateCouldNotProcess extends UnprocessableEntityException implements DomainError {
  readonly tag: string = 'NOTIFICATION_UPDATE_COULD_NOT_PROCESS';
  readonly description: string = 'Notificação não pode ser atualizada!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NotificationUpdateCouldNotProcess {
    return makeToFn(NotificationUpdateCouldNotProcess);
  }
}

export class IndicatedNotProcessDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'INDICATED_NOT_PROCESS';
  readonly description: string = 'Indicação não processada!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => IndicatedNotProcessDomainError {
    return makeToFn(IndicatedNotProcessDomainError);
  }
}

export class CantProcessPaymentDomainError extends InternalServerErrorException implements DomainError {
  readonly tag: string = 'CANT_PROCESS_PAYMENT';
  readonly description: string = 'Não foi possível processar o pagamento! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(details: CantProcessPaymentDomainErrorDetails): (_error?: unknown) => CantProcessPaymentDomainError {
    return makeToFn(CantProcessPaymentDomainError, { ...details, toString: (): string => JSON.stringify(details) });
  }
}

export class EmptyCartDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'EMPTY_CART';
  readonly description: string = 'Ops! Parece que não tem nenhum produto no seu carrinho.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => EmptyCartDomainError {
    return makeToFn(EmptyCartDomainError);
  }
}

export class InvalidPostalCodeDomainError extends ForbiddenException implements DomainError {
  readonly tag: string = 'INVALID_POSTAL_CODE';
  readonly description: string = 'O CEP informado é inválido! Por favor, tente de novo.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => InvalidPostalCodeDomainError {
    return makeToFn(InvalidPostalCodeDomainError);
  }
}

export class PostalCodeNotFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'NOT_FOUND_POSTAL_CODE';
  readonly description: string = 'Parece que este CEP não existe! Por favor, tente de novo.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => PostalCodeNotFoundDomainError {
    return makeToFn(PostalCodeNotFoundDomainError);
  }
}

export class InvalidObjectDomainError extends InternalServerErrorException implements DomainError {
  readonly tag: string = 'INVALID_OBJECT';
  readonly description: string = 'Objeto inválido!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => InvalidObjectDomainError {
    return makeToFn(InvalidObjectDomainError);
  }
}

export class ValidationErrorDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'VALIDATION_ERROR';
  readonly description: string;
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    description: string = 'Algo está inválido',
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
    this.description = 'Error de validação: ' + description;
  }

  static toFn(): (_error?: unknown) => ValidationErrorDomainError {
    return makeToFn(ValidationErrorDomainError);
  }
}

export class BadRequestDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'BAD_REQUEST';
  readonly description: string = 'Os dados recebidos são inválidos!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => BadRequestDomainError {
    return makeToFn(BadRequestDomainError);
  }
}

export class UnauthorizedExceptionDomainError extends UnauthorizedException implements DomainError {
  readonly tag: string = 'UNAUTHORIZED_EXCEPTION';
  readonly description: string = 'Recurso não autorizado!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => UnauthorizedExceptionDomainError {
    return makeToFn(UnauthorizedExceptionDomainError);
  }
}

export class InvalidCaptchaDomainError extends UnauthorizedException implements DomainError {
  readonly tag: string = 'INVALID_CAPTCHA';
  readonly description: string = 'Captcha é inválido!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => UnauthorizedExceptionDomainError {
    return makeToFn(UnauthorizedExceptionDomainError);
  }
}

export class DataNotFoundDomainError extends NotFoundException implements DomainError {
  readonly tag: string = 'DATA_NOT_FOUND';
  readonly description: string = 'Não foram encontrados dados para esta consulta!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => DataNotFoundDomainError {
    return makeToFn(DataNotFoundDomainError);
  }
}

export class QueryCannotBeRequestedDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'QUERY_CAN_NOT_BE_REQUESTED';
  readonly description: string = 'Essa consulta não pode ser realizada';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => QueryCannotBeRequestedDomainError {
    return makeToFn(QueryCannotBeRequestedDomainError);
  }
}

export class BlacklistKeysDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'BLACKLIST_KEYS';
  readonly description: string = 'Keys are in black list';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => BlacklistKeysDomainError {
    return makeToFn(BlacklistKeysDomainError);
  }
}

export class QueryRequestFailError extends BadRequestException implements DomainError {
  readonly tag: string = 'QUERY_REQUEST_FAIL';
  readonly description: string = 'Requisição para o provedor de consultas falhou!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => QueryRequestFailError {
    return makeToFn(QueryRequestFailError);
  }
}

export class QueryNotExistsError extends BadRequestException implements DomainError {
  readonly tag: string = 'QUERY_NOT_EXISTS';
  readonly description: string = 'Consulta não existe';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => QueryNotExistsError {
    return makeToFn(QueryNotExistsError);
  }
}

export class InvalidBillingError extends BadRequestException implements DomainError {
  readonly tag: string = 'INVALID_BILLING';
  readonly description: string = 'Invalid billing for consumption';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => InvalidBillingError {
    return makeToFn(InvalidBillingError);
  }
}

export class QuerWithoutFailedServicesError extends BadRequestException implements DomainError {
  readonly tag: string = 'QUERY_WITHOUT_FAILED_SERVICES';
  readonly description: string = 'Consulta não possui serviços para reprocessar';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => QuerWithoutFailedServicesError {
    return makeToFn(QuerWithoutFailedServicesError);
  }
}

export class QueryReprocessMaxRetryAttempsError extends BadRequestException implements DomainError {
  readonly tag: string = 'QUERY_WITHOUT_FAILED_SERVICES';
  readonly description: string = 'Consulta possui o número máximo de tentativas de reprocessamento';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => QueryReprocessMaxRetryAttempsError {
    return makeToFn(QueryReprocessMaxRetryAttempsError);
  }
}

export class QueryAlreadyReprocessingError extends BadRequestException implements DomainError {
  readonly tag: string = 'QUERY_ALREADY_REPROCESSING';
  readonly description: string = 'A consulta já está sendo reprocessada!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => QueryAlreadyReprocessingError {
    return makeToFn(QueryAlreadyReprocessingError);
  }
}

export class UnavailableForCurrentCarTier extends BadRequestException implements DomainError {
  readonly tag: string = 'UNAVAILABLE_FOR_CURRENT_CAR_TIER';
  readonly description: string = 'Não é possivel realizar a ação para esse carro com esse tier';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'warning';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => UnavailableForCurrentCarTier {
    return makeToFn(UnavailableForCurrentCarTier);
  }
}

export class UnsupportedCardBrand extends BadRequestException implements DomainError {
  readonly tag: string = 'UNSUPPORTED_CARD_BRAND';
  readonly description: string = 'Bandeira de cartão não suportado';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'warning';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => UnsupportedCardBrand {
    return makeToFn(UnsupportedCardBrand);
  }
}

export class NotFoundAutoReprocessQuery extends NotFoundException implements DomainError {
  readonly tag: string = 'NOT_FOUND_AUTO_REPROCESS_QUERY';
  readonly description: string = 'Não encontamos auto reprocessamento para esse id';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'warning';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NotFoundAutoReprocessQuery {
    return makeToFn(NotFoundAutoReprocessQuery);
  }
}

export class QueryOwnerInvalid extends NotFoundException implements DomainError {
  readonly tag: string = 'QUERY_OWNER_INVALID';
  readonly description: string = 'Essa consulta não precence ao mesmo dono.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'warning';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => QueryOwnerInvalid {
    return makeToFn(QueryOwnerInvalid);
  }
}

export class QueryReproccessIsRunning extends NotFoundException implements DomainError {
  readonly tag: string = 'QUERY_REPROCCESS_IS_RUNNING';
  readonly description: string = 'Já estamos processando automaticamente esta consulta, pedimos para esperar até 24h.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => QueryReproccessIsRunning {
    return makeToFn(QueryReproccessIsRunning);
  }
}

export class QueryReprocessWasProccessed extends NotFoundException implements DomainError {
  readonly tag: string = 'QUERY_REPROCESS_WAS_PROCCESSED';
  readonly description: string = 'Essa consulta já foi processada anteriormente com sucesso!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'warning';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => QueryReprocessWasProccessed {
    return makeToFn(QueryReprocessWasProccessed);
  }
}

export class CarNotFoundError extends NotFoundException implements DomainError {
  readonly tag: string = 'CAR_NOT_FOUND_ERROR';
  readonly description: string = 'Não temos nenhum carro cadastrado com esse id.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'warning';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => CarNotFoundError {
    return makeToFn(CarNotFoundError);
  }
}

export class NotMongoIdError extends BadRequestException implements DomainError {
  readonly tag: string = 'NotMongoIdError';
  readonly description: string = 'Não é um id de objeto válido';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NotMongoIdError {
    return makeToFn(NotMongoIdError);
  }
}

export class NotValidEvent extends BadRequestException implements DomainError {
  readonly tag: string = 'NotValidEvent';
  readonly description: string = 'Não é um evento válido';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';
  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NotValidEvent {
    return makeToFn(NotValidEvent);
  }
}

export class CarSubscriptionDeactivatedFoundError extends BadRequestException implements DomainError {
  readonly tag: string = 'CAR_SUBSCRIPTION_DEACTIVATED';
  readonly description: string = 'A assinatura para este veículo está desativada.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'warning';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => CarSubscriptionDeactivatedFoundError {
    return makeToFn(CarSubscriptionDeactivatedFoundError);
  }
}

export class NoPlanFoundDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'NO_PLAN_FOUND';
  readonly description: string = 'Plano não encontrado! Por favor, entre em contato com o suporte.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'warning';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NoPlanFoundDomainError {
    return makeToFn(NoPlanFoundDomainError);
  }
}

export class ConsentDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'ZAPAY_CONSENT';
  readonly description: string = 'Erro ao tentar dar o concentimento';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'error';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => ConsentDomainError {
    return makeToFn(ConsentDomainError);
  }
}

export class NotGuvenConsentDomainError extends BadRequestException implements DomainError {
  readonly tag: string = 'CONSENT_NOT_GIVEN';
  readonly description: string = 'Consentimento é nessesário!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'warning';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => NotGuvenConsentDomainError {
    return makeToFn(NotGuvenConsentDomainError);
  }
}

export class UnallowedToRemoveCreditCardError extends BadRequestException implements DomainError {
  readonly tag: string = 'UNALLOWED_TO_REMOVE_CREDIT_CARD';
  readonly description: string;
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    description: string,
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.description = description;
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(description: string): (_error?: unknown) => NoPlanFoundDomainError {
    return () => new UnallowedToRemoveCreditCardError(description);
  }
}

export class RateLimitReachedDomainError extends HttpException implements DomainError {
  readonly tag: string = 'RATE_LIMIT_REACHED';
  readonly description: string = 'Too many requests to same resource';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'none';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super('Throttler', HttpStatus.TOO_MANY_REQUESTS);
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => RateLimitReachedDomainError {
    return makeToFn(RateLimitReachedDomainError);
  }
}

export class ProviderNoDataForSelectedVersion extends ServiceUnavailableException implements DomainError {
  readonly tag: string = 'PROVIDER_NO_DATA_FOR_SELECTED_VERSION';
  readonly description: string = 'Não existe dados disponíveis para a versão selecionada do veículo.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'warning';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (error?: unknown) => ProviderNoDataForSelectedVersion {
    return makeToFn(ProviderNoDataForSelectedVersion);
  }

  static toFnService(service: string): (_error?: unknown) => ProviderNoDataForSelectedVersion {
    return makeToFn(ProviderNoDataForSelectedVersion, { service });
  }
}

export class WebhookMaxLimitError extends InternalServerErrorException implements DomainError {
  readonly tag: string = 'WEBHOOK_MAX_LIMIT';
  readonly description: string = 'Você atingiu o numero maximo de para a sua conta!';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'warning';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => WebhookMaxLimitError {
    return makeToFn(WebhookMaxLimitError);
  }
}

export class PlateIsRequiredError extends BadRequestException implements DomainError {
  readonly tag: string = 'PLATE_KEY_IS_REQUIRED';
  readonly description: string = 'É preciso informar a placa.';
  readonly details: IDomainErrorDetail;
  readonly internalDetails: IDomainErrorDetail;
  readonly errorLevel: ErrorLevel = 'warning';

  constructor(
    details: IDomainErrorDetail = defaultDomainErrorDetail,
    internalDetails: IDomainErrorDetail = defaultDomainErrorDetail,
  ) {
    super();
    this.details = details;
    this.internalDetails = internalDetails;
  }

  static toFn(): (_error?: unknown) => PlateIsRequiredError {
    return makeToFn(PlateIsRequiredError);
  }
}
