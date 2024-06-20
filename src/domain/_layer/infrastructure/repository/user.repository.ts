import { IBaseRepository } from './base.repository';
import { UserDto } from '../../data/dto/user.dto';

export enum UserDataImportance {
  HAS_IMPORTANT,
  HASNT_IMPORTANT,
  UNKNOWN,
}

export abstract class UserRepository<TransactionReference = unknown>
  implements IBaseRepository<UserDto, TransactionReference>
{
  abstract getById(id: string): Promise<UserDto>;

  abstract getByIds(ids: ReadonlyArray<Pick<UserDto, 'id'>>): Promise<ReadonlyArray<UserDto>>;

  abstract getByBillingId(billingId: string): Promise<UserDto | null>;

  abstract getByIdWithPassword(id: string): Promise<UserDto>;

  abstract getByCPF(cpf: string): Promise<UserDto | null>;

  abstract getByEmail(email: string): Promise<UserDto | null>;

  abstract getByEmailWithPassword(email: string): Promise<UserDto | null>;

  abstract getByEmailOrCPF(email: string, cpf: string): Promise<UserDto | null>;

  abstract getByEmailOrCPFWithPassword(email: string, cpf: string): Promise<UserDto | null>;

  abstract getByQueryId(queryId: string): Promise<UserDto | null>;

  abstract getByPaymentId(paymentId): Promise<UserDto | null>;

  abstract insert(inputDto: Partial<UserDto>, transactionReference?: TransactionReference): Promise<UserDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<UserDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<UserDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<UserDto>;

  abstract updateById(
    id: string,
    updateDto: Partial<UserDto>,
    transactionReference?: TransactionReference,
  ): Promise<UserDto>;

  abstract updateManyBy(
    users: ReadonlyArray<UserDto>,
    updateDto: Partial<UserDto>,
    transaction?: TransactionReference,
  ): Promise<ReadonlyArray<UserDto>>;

  abstract count(): Promise<number>;

  abstract hasUserAnyImportantData(userId: string): Promise<UserDataImportance>;

  abstract setToDeletion(userId: string, whenDate: Date): Promise<UserDto>;

  abstract cancelDeletionById(userId: string): Promise<UserDto>;

  abstract cancelDeletionByEmail(email: string): Promise<UserDto>;

  abstract countTotalUsers(): Promise<number>;
}
