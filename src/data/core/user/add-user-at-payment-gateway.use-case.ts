import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Span } from '@alissonfpmorais/rastru';
import { Injectable } from '@nestjs/common';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserAddress, UserExternalArcControl, UserExternalArcTenantControl } from 'src/domain/_entity/user.entity';
import { PaymentManagementDto } from 'src/domain/_layer/data/dto/payment-management.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { PaymentManagementRepository } from 'src/domain/_layer/infrastructure/repository/payment-managament.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import {
  AddUserAtPaymentGatewayDomain,
  AddUserAtPaymentGatewayIO,
  IAddUserAtPaymentGatewayOptions,
} from 'src/domain/core/user/add-user-at-payment-gateway.domain';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';
import { ObjectUtil } from 'src/infrastructure/util/object.util';
import { UserHelper } from './user.helper';

@Injectable()
export class AddUserAtPaymentGatewayUseCase implements AddUserAtPaymentGatewayDomain {
  private _originalCnpj: string;
  private static _defaultAddUserAtPaymentGatewayOptions: IAddUserAtPaymentGatewayOptions = {
    ensurePossibleToCreatePayment: false,
  };

  constructor(
    private readonly _userHelper: UserHelper,
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _userRepository: UserRepository,
    private readonly _paymentManagementRepository: PaymentManagementRepository,
    private readonly _objectUtil: ObjectUtil,
    private readonly _envService: EnvService,
  ) {
    this._originalCnpj = this._envService.get(ENV_KEYS.CNPJ1);
  }

  @Span('payment-v3')
  addUserAtGateway(
    userId: string,
    reqParentId: string,
    opts: IAddUserAtPaymentGatewayOptions = AddUserAtPaymentGatewayUseCase._defaultAddUserAtPaymentGatewayOptions,
  ): AddUserAtPaymentGatewayIO {
    return this._userHelper
      .getUser(userId)
      .flatMap(this._fixUser.bind(this))
      .flatMap((user: UserDto) =>
        this._updateWithExternalCustomerIds(user, reqParentId, opts.ensurePossibleToCreatePayment),
      );
  }

  private _parseAddress(user: UserDto): UserDto {
    const address: UserAddress = user.address;
    return {
      ...user,
      address: address ? UserHelper.removeDiacriticAndSpecialCharactersFromAddress(address) : address,
    };
  }

  private _parseName(user: UserDto): UserDto {
    return {
      ...user,
      name: UserHelper.validateAndFixName(user.name),
    };
  }

  private _mergeTenants(user: UserDto, tenants: ReadonlyArray<UserExternalArcTenantControl>): UserDto {
    return this._objectUtil.deepMerge(user, { externalControls: { arc: { tenants: tenants } } });
  }

  private _parseArcControls(user: UserDto): EitherIO<UnknownDomainError, UserDto> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._paymentManagementRepository.getCurrent()).map(
      (management: PaymentManagementDto) => {
        const cnpjs: ReadonlyArray<string> =
          management?.rules?.map((rule: { readonly cnpj: string }) => rule.cnpj).sort() || [];

        if (cnpjs.length <= 0) return user;

        const arc: UserExternalArcControl = user.externalControls.arc;

        const tenants: ReadonlyArray<UserExternalArcTenantControl> = cnpjs.map((cnpj: string) => {
          const tenant: UserExternalArcTenantControl =
            arc.tenants.find((tenant: UserExternalArcTenantControl) => tenant.cnpj === cnpj) || null;
          const id: string = tenant?.id ? tenant?.id : cnpj === this._originalCnpj && arc.id ? arc.id : null;
          return { id, cnpj };
        });

        const updatedUser: UserDto = this._mergeTenants(user, tenants);

        if (arc.tenants.length !== tenants.length) return updatedUser;

        const unchangedAmount: number = tenants.filter((tenant: UserExternalArcTenantControl, index: number) => {
          const original: UserExternalArcTenantControl = arc.tenants[index];
          return tenant.id === original.id && tenant.cnpj === original.cnpj;
        }).length;

        return arc.tenants.length === unchangedAmount ? user : updatedUser;
      },
    );
  }

  private async _updateUserUponChange(possiblyUpdatedUser: UserDto, currentUser: UserDto): Promise<UserDto> {
    if (
      possiblyUpdatedUser.name !== currentUser.name ||
      possiblyUpdatedUser.address.city !== currentUser.address.city ||
      possiblyUpdatedUser.address.complement !== currentUser.address.complement ||
      possiblyUpdatedUser.address.neighborhood !== currentUser.address.neighborhood ||
      possiblyUpdatedUser.address.number !== currentUser.address.number ||
      possiblyUpdatedUser.address.state !== currentUser.address.state ||
      possiblyUpdatedUser.address.street !== currentUser.address.street ||
      possiblyUpdatedUser.address.zipCode !== currentUser.address.zipCode ||
      // Validação baseada na referência do objeto
      possiblyUpdatedUser.externalControls.arc.tenants !== currentUser.externalControls.arc.tenants
    ) {
      return this._userRepository.updateById(possiblyUpdatedUser.id, possiblyUpdatedUser);
    } else {
      return currentUser;
    }
  }

  private _fixUser(user: UserDto): EitherIO<UnknownDomainError, UserDto> {
    return EitherIO.of(UnknownDomainError.toFn(), user)
      .map(this._parseName.bind(this))
      .map(this._parseAddress.bind(this))
      .flatMap(this._parseArcControls.bind(this))
      .map((possiblyUpdatedUser: UserDto) => this._updateUserUponChange(possiblyUpdatedUser, user));
  }

  private _updateWithExternalCustomerIds(
    user: UserDto,
    reqParentId: string,
    shouldEnsure: boolean,
  ): EitherIO<UnknownDomainError, UserDto> {
    type Response = { readonly wasPresent: boolean; readonly externalId: string };

    const unregisteredTenantsAmount: ReadonlyArray<UserExternalArcTenantControl> =
      user.externalControls.arc.tenants.filter((tenant: UserExternalArcTenantControl) => !tenant.id);
    const hasTenantsToRegister: boolean = unregisteredTenantsAmount.length > 0;

    if (!hasTenantsToRegister) return EitherIO.of(UnknownDomainError.toFn(), user);

    return EitherIO.of(ProviderUnavailableDomainError.toFn(), user.externalControls.arc.tenants)
      .map((tenants: ReadonlyArray<UserExternalArcTenantControl>) => {
        const promises: ReadonlyArray<Promise<Response>> = tenants.map((tenant: UserExternalArcTenantControl) => {
          return tenant.id
            ? Promise.resolve({ wasPresent: true, externalId: tenant.id })
            : this._paymentGatewayService
                .createCustomerIfNotExists(user, tenant.cnpj, reqParentId, {
                  ensurePossibleToCreatePayment: shouldEnsure,
                })
                .then((externalId: string) => ({ wasPresent: false, externalId }));
        });

        return Promise.allSettled(promises);
      })
      .flatMap((responses: ReadonlyArray<PromiseSettledResult<Response>>) => {
        const registeredTenantsAmount: ReadonlyArray<PromiseSettledResult<Response>> = responses.filter(
          (response: PromiseSettledResult<Response>) =>
            response.status === 'fulfilled' && response.value.wasPresent === false,
        );
        const hasAtLeastOneRegistered: boolean = registeredTenantsAmount.length > 0;

        if (!hasAtLeastOneRegistered) return EitherIO.raise(ProviderUnavailableDomainError.toFn());

        const tenants: ReadonlyArray<UserExternalArcTenantControl> = user.externalControls.arc.tenants.map(
          (tenant: UserExternalArcTenantControl, index: number) => {
            const response: PromiseSettledResult<Response> = responses[index];
            if (response.status !== 'fulfilled' || response.value.wasPresent) return tenant;

            return { ...tenant, id: response.value.externalId };
          },
        );

        return EitherIO.of(UnknownDomainError.toFn(), this._mergeTenants(user, tenants));
      })
      .map((updatedUserDto: UserDto) => {
        return this._userRepository.updateById(updatedUserDto.id, updatedUserDto);
      });
  }
}
