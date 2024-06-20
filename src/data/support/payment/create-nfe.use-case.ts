import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Span } from '@alissonfpmorais/rastru';
import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '../../../domain/_entity/payment.entity';
import {
  InvalidPaymentStateForOperationDomainError,
  NfeAlreadyCreatedDomainError,
  NoPaymentFoundDomainError,
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { NfeDto } from '../../../domain/_layer/data/dto/nfe.dto';
import { PaymentDto } from '../../../domain/_layer/data/dto/payment.dto';
import { UserDto } from '../../../domain/_layer/data/dto/user.dto';
import { NfeRepository } from '../../../domain/_layer/infrastructure/repository/nfe.repository';
import { PaymentRepository } from '../../../domain/_layer/infrastructure/repository/payment.repository';
import { UserRepository } from '../../../domain/_layer/infrastructure/repository/user.repository';
import { NFe, NfeService } from '../../../domain/_layer/infrastructure/service/nfe.service';
import { CreateInvoiceIO, CreateNfeDomain } from '../../../domain/support/payment/create-nfe.domain';

type Data = { readonly paymentDto: PaymentDto; readonly userDto: UserDto };

@Injectable()
export class CreateNfeUseCase implements CreateNfeDomain {
  constructor(
    private readonly _nfeRepository: NfeRepository,
    private readonly _paymentRepository: PaymentRepository,
    private readonly _userRepository: UserRepository,
    private readonly _nfeService: NfeService,
  ) {}

  @Span('payment-v3')
  createNfe(paymentId: string): CreateInvoiceIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._paymentRepository.getById(paymentId))
      .filter(NoPaymentFoundDomainError.toFn(), Boolean)
      .filter(
        InvalidPaymentStateForOperationDomainError.toFn(),
        (paymentDto: PaymentDto) => paymentDto.status === PaymentStatus.PAID,
      )
      .filter(NfeAlreadyCreatedDomainError.toFn(), (paymentDto: PaymentDto) => !paymentDto.nfeId)
      .flatMap((paymentDto: PaymentDto) => {
        return this._getUser(paymentDto.billingId).map((userDto: UserDto) => ({ paymentDto, userDto }));
      })
      .flatMap(this._createNfe.bind(this));
  }

  private _getUser(billingId: string): EitherIO<UnknownDomainError | NoUserFoundDomainError, UserDto> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getByBillingId(billingId)).filter(
      NoUserFoundDomainError.toFn(),
      Boolean,
    );
  }

  private _createNfe({ paymentDto, userDto }: Data): EitherIO<ProviderUnavailableDomainError, NfeDto> {
    const description: string = 'CONSULTA VEICULAR - OLHO NO CARRO';

    return this._nfeService.generateNfe(description, paymentDto, userDto).map(async (nfe: NFe) => {
      const nfeDto: NfeDto = await this._nfeRepository.insert({
        description,
        valueInCents: paymentDto.totalPaidInCents,
        userId: userDto.id,
        paymentId: paymentDto.id,
        cnpj: paymentDto.cnpj,
        externalNfeId: nfe.externalId,
        number: nfe.number,
        confirmationNumber: nfe.confirmationNumber,
      });
      await this._paymentRepository.updateById(paymentDto.id, { ...paymentDto, nfeId: nfeDto.id });
      return nfeDto;
    });
  }
}
