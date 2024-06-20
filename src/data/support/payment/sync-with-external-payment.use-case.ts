import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Span } from '@alissonfpmorais/rastru';
import { Injectable } from '@nestjs/common';
import {
  PaymentGatewayType,
  PaymentStatus,
  PaymentType,
  paymentStatusTransitionRule,
} from 'src/domain/_entity/payment.entity';
import { NoPaymentFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { CurrentGatewayDto, ExternalPaymentStateDto } from 'src/domain/_layer/data/dto/payment-response.dto';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import { PaymentRepository } from 'src/domain/_layer/infrastructure/repository/payment.repository';
import { EventEmitterService } from 'src/domain/_layer/infrastructure/service/event/event.service';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import {
  SyncWithExternalPaymentDomain,
  SyncWithExternalPaymentDomainErrors,
  SyncWithExternalPaymentIO,
} from 'src/domain/support/payment/sync-with-external-payment.domain';
import { AppEventDispatcher } from 'src/infrastructure/decorators/events.decorator';
import { ObjectUtil } from 'src/infrastructure/util/object.util';
import { TransitionUtil } from 'src/infrastructure/util/transition.util';

@Injectable()
export class SyncWithExternalPaymentUseCase implements SyncWithExternalPaymentDomain {
  constructor(
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _paymentRepository: PaymentRepository,
    private readonly _transitionUtil: TransitionUtil,
    private readonly _objectUtil: ObjectUtil,
    @AppEventDispatcher() private readonly _eventEmitterService: EventEmitterService,
  ) {}

  @Span('payment-v3')
  syncWithExternalReference(
    externalReference: string,
    idempotence: string,
    gateway: PaymentGatewayType,
    reqParentId: string,
  ): SyncWithExternalPaymentIO {
    return this._getPayment(externalReference, idempotence, gateway).flatMap((payment: PaymentDto) =>
      this._getExternalPaymentStateAndUpdate(payment, reqParentId),
    );
  }

  syncInternal(paymentId: string, reqParentId: string): SyncWithExternalPaymentIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._paymentRepository.getById(paymentId))
      .filter(NoPaymentFoundDomainError.toFn(), (mayPayment: PaymentDto) => Boolean(mayPayment))
      .flatMap((payment: PaymentDto) => this._getExternalPaymentStateAndUpdate(payment, reqParentId));
  }

  private _getPayment(
    externalReference: string,
    idempotence: string,
    gateway: PaymentGatewayType,
  ): SyncWithExternalPaymentIO {
    return this._getPaymentByExternalReference(externalReference, gateway).catch(
      (error: SyncWithExternalPaymentDomainErrors) => {
        return error instanceof NoPaymentFoundDomainError
          ? this._getPaymentByIdempotence(externalReference, idempotence).safeRun()
          : Either.left(error);
      },
    );
  }

  private _getPaymentByExternalReference(
    externalReference: string,
    gateway: PaymentGatewayType,
  ): SyncWithExternalPaymentIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => {
      return this._paymentRepository.getByExternalReferenceGateway(externalReference, gateway);
    }).filter(NoPaymentFoundDomainError.toFn(), Boolean);
  }

  private _getPaymentByIdempotence(externalReference: string, idempotence: string): SyncWithExternalPaymentIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._paymentRepository.getById(idempotence))
      .filter(NoPaymentFoundDomainError.toFn(), Boolean)
      .map((payment: PaymentDto) => {
        return this._paymentRepository.updateById(payment.id, {
          gateway: PaymentGatewayType.ARC,
          chargeId: externalReference,
        });
      });
  }

  private _getExternalPaymentStateAndUpdate(
    payment: PaymentDto,
    reqParentId: string,
  ): EitherIO<UnknownDomainError, PaymentDto> {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._paymentGatewayService.fetchPayment(
        payment.paymentExternalRef || payment.chargeId,
        payment.cnpj,
        reqParentId,
        { paymentId: payment.id },
      ),
    ).flatMap((externalState: ExternalPaymentStateDto) => {
      return this._modifyInternalPaymentWithExternal(payment, externalState, this._paymentGatewayService.gateway)
        .map((paymentToUpdate: PaymentDto) => this._paymentRepository.updateById(paymentToUpdate.id, paymentToUpdate))
        .tap((updatedPayment: PaymentDto) => this._notifyIfPaymentSucceeded(payment, updatedPayment));
    });
  }

  @Span('payment-v3')
  private _modifyInternalPaymentWithExternal(
    payment: PaymentDto,
    externalState: ExternalPaymentStateDto,
    gateway: PaymentGatewayType,
  ): EitherIO<UnknownDomainError, PaymentDto> {
    return EitherIO.of(UnknownDomainError.toFn(), payment)
      .map((payment: PaymentDto) => ({ ...payment, gateway }))
      .map((payment: PaymentDto) =>
        SyncWithExternalPaymentUseCase._appendExternalResourceToPayment(payment, externalState),
      )
      .map((payment: PaymentDto) => this._updateInternalPaymentStatus(payment, externalState))
      .map((payment: PaymentDto) => this._updateGatewayDetail(payment, gateway, externalState));
  }

  private static _appendExternalResourceToPayment(
    payment: PaymentDto,
    { pixResource, bankSlipResource }: ExternalPaymentStateDto,
  ): PaymentDto {
    switch (payment.type) {
      case PaymentType.PIX:
        return pixResource
          ? {
              ...payment,
              pix: pixResource,
            }
          : payment;

      case PaymentType.BANKING_BILLET:
        return bankSlipResource
          ? {
              ...payment,
              bankingBillet: bankSlipResource,
            }
          : payment;

      case PaymentType.CREDIT_CARD:
        return payment;
    }
  }

  private _updateGatewayDetail(
    payment: PaymentDto,
    gateway: PaymentGatewayType,
    externalState: ExternalPaymentStateDto,
  ): PaymentDto {
    if (gateway === PaymentGatewayType.ARC) {
      // eslint-disable-next-line prefer-const
      let updates: Partial<PaymentDto> = {
        paymentExternalRef: payment.paymentExternalRef || payment.chargeId,
      };

      const currentGateway: CurrentGatewayDto | null = externalState.details?.currentGateway;
      const gatewayRef: string | null = currentGateway?.referenceIn;

      // eslint-disable-next-line functional/immutable-data
      if (typeof gatewayRef === 'string') updates['chargeId'] = gatewayRef;

      const gatewayName: string | null = currentGateway?.gateway;

      if (typeof gatewayName === 'string') {
        // eslint-disable-next-line functional/immutable-data
        updates['gatewayDetails'] = {
          arc: {
            gatewayHistory: {
              [gatewayName.toLowerCase()]: {
                createdAt: new Date().toISOString(),
                referenceIn: gatewayRef,
              },
            },
          },
        };
      }

      return this._objectUtil.deepMerge(payment, updates);
    } else {
      return payment;
    }
  }

  private _updateInternalPaymentStatus(payment: PaymentDto, externalState: ExternalPaymentStateDto): PaymentDto {
    const newStatus: PaymentStatus = externalState.status;
    const isValidTransitionState: boolean = this._transitionUtil.validateTransition(
      payment.status,
      newStatus,
      paymentStatusTransitionRule,
    );

    const isPaid: boolean = newStatus === PaymentStatus.PAID;

    return !isValidTransitionState
      ? payment
      : isPaid
      ? {
          ...payment,
          status: newStatus,
          totalPaidInCents: isPaid ? payment.totalPriceWithDiscountInCents : payment.totalPaidInCents,
          paid: isPaid,
          paymentDate: isPaid ? externalState.paidAt : payment.paymentDate,
        }
      : {
          ...payment,
          status: newStatus,
        };
  }

  @Span('payment-v3')
  private _notifyIfPaymentSucceeded(payment: PaymentDto, updatedPayment: PaymentDto): PaymentDto {
    if (payment.status !== updatedPayment.status && updatedPayment.status === PaymentStatus.PAID) {
      this._eventEmitterService.dispatchPaymentSucceeded({ paymentId: payment.id });
    }
    return updatedPayment;
  }
}
