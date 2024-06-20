import { EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';

export type AddUserAtPaymentGatewayDomainErrors =
  | UnknownDomainError
  | NoUserFoundDomainError
  | ProviderUnavailableDomainError;

export type AddUserAtPaymentGatewayIO = EitherIO<AddUserAtPaymentGatewayDomainErrors, UserDto>;

export interface IAddUserAtPaymentGatewayOptions {
  readonly ensurePossibleToCreatePayment: boolean;
}

export abstract class AddUserAtPaymentGatewayDomain {
  abstract addUserAtGateway(
    userId: string,
    reqParentId: string,
    opts?: IAddUserAtPaymentGatewayOptions,
  ): AddUserAtPaymentGatewayIO;
}
