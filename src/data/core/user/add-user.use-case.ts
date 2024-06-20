import { Either, EitherIO, ErrorFn } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { BillingType } from 'src/domain/_entity/billing.entity';
import {
  InvalidPostalCodeDomainError,
  PostalCodeNotFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
  UserAlreadyExistsDomainError,
  UserHasWeakPasswordDomainError,
  ValidationErrorDomainError,
} from 'src/domain/_entity/result.error';
import { UserAddress, UserEntity, UserType } from 'src/domain/_entity/user.entity';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { PostalCodeInfo } from 'src/domain/_layer/data/dto/postal-code-info.dto';
import { PriceTableDto } from 'src/domain/_layer/data/dto/price-table.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { BillingRepository } from 'src/domain/_layer/infrastructure/repository/billing.repository';
import { CarRevendorRepository } from 'src/domain/_layer/infrastructure/repository/car-revendor.repository';
import { PriceTableRepository } from 'src/domain/_layer/infrastructure/repository/price-table.repository';
import { MarkintingService } from 'src/domain/_layer/infrastructure/service/marketing.service';
import {
  IUserDataValidatedResponse,
  PaymentGatewayService,
} from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { QueryPostalCodeService } from 'src/domain/_layer/infrastructure/service/query-postal-code.service';
import { ConsentsService } from 'src/domain/_layer/infrastructure/service/user-consents.service';
import { SignInDomain } from 'src/domain/support/auth/sign-in.domain';
import { EnvService, EnvVariableName } from 'src/infrastructure/framework/env.service';
import { EncryptionUtil } from 'src/infrastructure/util/encryption.util';
import { DeviceKind } from '../../../domain/_layer/infrastructure/middleware/device-info.middleware';
import { UserRepository } from '../../../domain/_layer/infrastructure/repository/user.repository';
import { EventEmitterService } from '../../../domain/_layer/infrastructure/service/event/event.service';
import {
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
} from '../../../domain/_layer/infrastructure/service/notification';
import { AddUserDomain, AddUserIO, AddUserParams } from '../../../domain/core/user/add-user.domain';
import { AppEventDispatcher } from '../../../infrastructure/decorators/events.decorator';
import { TransactionHelper } from '../../../infrastructure/repository/transaction.helper';
import { AuthHelper } from '../../support/auth/auth.helper';
import { UserHelper } from './user.helper';

@Injectable()
export class AddUserUseCase implements AddUserDomain {
  private readonly _cnpjs: ReadonlyArray<string>;

  constructor(
    private readonly _authHelper: AuthHelper,
    private readonly _userRepository: UserRepository,
    private readonly _billingRepository: BillingRepository,
    private readonly _priceTableRepository: PriceTableRepository,
    private readonly _carVendorRepository: CarRevendorRepository,
    private readonly _encryptionUtil: EncryptionUtil,
    private readonly _transactionHelper: TransactionHelper,
    private readonly _userConsentService: ConsentsService,
    private readonly _signInDomain: SignInDomain,
    private readonly _notificationService: NotificationServiceGen,
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _markintingService: MarkintingService,
    private readonly _queryPostalCodeService: QueryPostalCodeService,
    @AppEventDispatcher() private readonly _eventEmitterService: EventEmitterService,
    private readonly _envService: EnvService,
  ) {
    // eslint-disable-next-line functional/prefer-readonly-type
    const cnpjs: Array<string> = [];

    for (let i: number = 1; ; i++) {
      const cnpj: string = _envService.get(`CNPJ${i}` as EnvVariableName);
      if (typeof cnpj === 'undefined') {
        this._cnpjs = cnpjs;
        break;
      }

      // eslint-disable-next-line functional/immutable-data
      cnpjs.push(cnpj);
    }
  }

  addUser(params: AddUserParams, deviceKind: DeviceKind, reqParentId: string): AddUserIO {
    const { email, cpf }: AddUserParams = params;
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getByEmailOrCPF(email, cpf))
      .flatMap(this._validateUserAlreadyExists())
      .map(() => ({ ...params, name: UserHelper.validateAndFixName(params.name) }))
      .flatMap((updatedParams: AddUserParams) =>
        this._verifyAndCastAddress(updatedParams.address).map(this._appendAddress(updatedParams)),
      )
      .filter(UserHasWeakPasswordDomainError.toFn(), () => UserHelper.validatePasswordStrength(params.password))
      .flatMap((updatedParams: AddUserParams) => this._verifyUser(updatedParams, reqParentId))
      .map((updatedParams: AddUserParams) => this._insertUser(updatedParams))
      .tap((user: UserDto) => this._userConsentService.createUserConsentBatch(user.id, params.consents))
      .tap(() => this._markintingService.registerNewClient(params))
      .tap((user: UserDto) =>
        this._eventEmitterService.dispatchUserCreated({ userId: user.id, reqParentId: reqParentId, user: user }),
      )
      .tap((user: UserDto) =>
        typeof params.isCarRevendor === 'boolean'
          ? this._carVendorRepository.insert({ userId: user.id, status: params.isCarRevendor })
          : null,
      )
      .map((user: UserDto) => {
        const expiresIn: string = this._signInDomain.calculateExpiration(deviceKind);
        return this._signInDomain.encodeToken(user, expiresIn);
      });
  }

  private _validateUserAlreadyExists(): (
    maybeUser: UserDto | null,
    errorFn: ErrorFn<UnknownDomainError>,
  ) => EitherIO<UnknownDomainError | UserAlreadyExistsDomainError, UserDto> {
    return (
      maybeUser: UserDto | null,
      errorFn: ErrorFn<UnknownDomainError>,
    ): EitherIO<UnknownDomainError | UserAlreadyExistsDomainError, UserDto> =>
      EitherIO.of(errorFn, maybeUser)
        .filter(UserAlreadyExistsDomainError.toFn(), (maybeUser: UserDto | null) => !maybeUser)
        .catch(async (error: UnknownDomainError | UserAlreadyExistsDomainError) => {
          if (error instanceof UserAlreadyExistsDomainError) {
            const user: UserDto = await this._userRepository.getByIdWithPassword(maybeUser.id);
            this._notifyUserAlreadyExists(user).finally();
          }

          return Either.left(error);
        });
  }

  private _notifyUserAlreadyExists({ id, email, name, password, createdAt }: UserDto): Promise<boolean> {
    const urlToRedirect: string = this._authHelper.generateUrlToChangePassword(id, password, createdAt);
    return this._notificationService.dispatch(NotificationTransport.EMAIL, NotificationType.USER_ALREADY_REGISTERED, {
      email: email,
      name: name,
      urlToRedirect: urlToRedirect,
    });
  }

  private _appendAddress(params: AddUserParams): (arg0: UserAddress) => AddUserParams {
    return (address: UserAddress): AddUserParams => ({ ...params, address });
  }

  private _verifyAndCastAddress(
    address: UserAddress | null,
  ): EitherIO<UnknownDomainError | InvalidPostalCodeDomainError, UserAddress> {
    type WithExternalData = readonly [UserAddress, PostalCodeInfo];

    if (!address) return EitherIO.raise(InvalidPostalCodeDomainError.toFn());
    else
      return EitherIO.from(ProviderUnavailableDomainError.toFnService('POSTAL_CODE'), () =>
        this._queryPostalCodeService.queryPostalCode(address.zipCode),
      )
        .filter(PostalCodeNotFoundDomainError.toFn(), (info: PostalCodeInfo | null) => info !== null)
        .map((info: PostalCodeInfo): WithExternalData => {
          const didReceivedState: boolean = Boolean(address.state);
          const nextAddress: UserAddress = didReceivedState ? address : { ...address, state: info.uf };
          return [nextAddress, info];
        })
        .filter(
          InvalidPostalCodeDomainError.toFn(),
          ([address, info]: WithExternalData): boolean => info.uf.toLowerCase() === address.state.toLowerCase(),
        )
        .map(([address, info]: WithExternalData): UserAddress => {
          const didReceivedCity: boolean = Boolean(address.city);
          const nextAddress: UserAddress = didReceivedCity ? address : { ...address, city: info.city };
          return nextAddress;
        })
        .map(UserHelper.removeDiacriticAndSpecialCharactersFromAddress)
        .map(UserHelper.truncateAddress);
  }

  private _verifyUser(
    params: AddUserParams,
    reqParentId: string,
  ): EitherIO<ProviderUnavailableDomainError | ValidationErrorDomainError, AddUserParams> {
    return EitherIO.from(ProviderUnavailableDomainError.toFnService('PAYMENT_GATEWAY'), () => {
      const validations: ReadonlyArray<Promise<IUserDataValidatedResponse>> = this._cnpjs.map((cnpj: string) => {
        return this._paymentGatewayService.validateUser(params, cnpj, reqParentId);
      });

      return Promise.allSettled(validations);
    }).flatMap((promisesResult: ReadonlyArray<PromiseSettledResult<IUserDataValidatedResponse>>) => {
      const responses: ReadonlyArray<IUserDataValidatedResponse> = promisesResult.map(
        (response: PromiseSettledResult<IUserDataValidatedResponse>) =>
          response.status === 'fulfilled' && response.value,
      );

      const isValid: boolean = responses.every((response: IUserDataValidatedResponse) => response.isValid);

      if (isValid) {
        return EitherIO.of(UnknownDomainError.toFn(), params);
      } else {
        const msg: string = this._reduceMessages(responses);
        return EitherIO.raise(() => new ValidationErrorDomainError(msg, { msg }));
      }
    });
  }

  private _insertUser(params: AddUserParams): Promise<UserEntity> {
    return this._transactionHelper.withTransaction(async (transactionReference: unknown): Promise<UserEntity> => {
      const encryptedPassword: string = this._encryptionUtil.encrypt(params.password);
      const user: UserEntity = await this._userRepository.insert(
        {
          cpf: params.cpf,
          email: params.email,
          name: params.name,
          creationOrigin: params.creationOrigin,
          address: params.address,
          phoneNumber: params.phoneNumber,
          type: UserType.PRE_PAID,
          password: encryptedPassword,
        },
        transactionReference,
      );

      const defaultPriceTable: PriceTableDto = await this._priceTableRepository.getDefaultPriceTable();
      const billing: BillingDto = await this._billingRepository.insert(
        {
          userId: user.id,
          billingType: BillingType.PRE_PAID,
          priceTableId: defaultPriceTable.id,
        },
        transactionReference,
      );

      return this._userRepository.updateById(user.id, { billingId: billing.id }, transactionReference);
    });
  }

  private _reduceMessages(responses: ReadonlyArray<IUserDataValidatedResponse>): string {
    // eslint-disable-next-line functional/prefer-readonly-type
    const uniqueErrors: Set<string> = new Set<string>();
    responses.forEach((response: IUserDataValidatedResponse) => {
      if (response.errorMsg && response.errorMsg.trim() !== '') {
        uniqueErrors.add(response.errorMsg.trim());
      }
    });

    return Array.from(uniqueErrors).join('\n');
  }
}
