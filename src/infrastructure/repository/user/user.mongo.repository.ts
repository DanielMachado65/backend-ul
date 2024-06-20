import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import * as mongoose from 'mongoose';
import { ClientSession, Model } from 'mongoose';
import { MBilling } from 'src/infrastructure/model/billing.model';
import { MConsumptionStatement } from 'src/infrastructure/model/consumption-statement.model';
import { MCoupon } from 'src/infrastructure/model/coupon.model';
import { MInvoice } from 'src/infrastructure/model/invoice.model';
import { MPayment } from 'src/infrastructure/model/payment.model';
import { MQuery } from 'src/infrastructure/model/query.model';
import {
  UserCreationOrigin,
  UserEntity,
  UserExternalArcTenantControl,
  UserType,
} from '../../../domain/_entity/user.entity';
import { UserDto } from '../../../domain/_layer/data/dto/user.dto';
import { UserDataImportance, UserRepository } from '../../../domain/_layer/infrastructure/repository/user.repository';
import { MUser, MUserDocument, MUserExternalArcTenantControlsGateway } from '../../model/user.model';
import { MongoBaseRepository, WithId, WithMongoId } from '../mongo.repository';

type UserQueryType = { readonly cpf: string } | { readonly email: string };

@Injectable()
export class UserMongoRepository extends MongoBaseRepository<UserDto, MUser> implements UserRepository<ClientSession> {
  constructor(
    @InjectModel(MUser.name) readonly model: Model<MUserDocument>,
    @InjectModel(MPayment.name) private readonly _paymentModel: Model<MPayment>,
    @InjectModel(MQuery.name) private readonly _queryModel: Model<MQuery>,
  ) {
    super();
    this.model = model;
  }

  fromDtoToSchema(dto: Partial<UserDto>): Partial<MUser> {
    return {
      email: dto.email,
      cpf: dto.cpf,
      pass: dto.password,
      name: dto.name,
      billing: this.parseStringToObjectId(dto.billingId),
      type: dto.type,
      lastLogin: dto.lastLogin && new Date(dto.lastLogin),
      createAt: dto.createdAt && new Date(dto.createdAt),
      status: dto.status,
      creationOrigin: dto.creationOrigin,
      generalData: (dto.address || dto.phoneNumber) && {
        address: dto.address && {
          zipcode: dto.address.zipCode,
          city: dto.address.city,
          state: dto.address.state,
          neighborhood: dto.address.neighborhood,
          street: dto.address.street,
          complement: dto.address.complement,
          number: dto.address.number,
        },
        phoneNumber1: dto.phoneNumber,
      },
      partner: this.parseStringToObjectId(dto.partnerId),
      company: dto.company && {
        cnpj: dto.company.cnpj,
        socialName: dto.company.socialName,
        fantasyName: dto.company.fantasyName,
        codigoCnae: dto.company.cnae,
        stateSubscription: dto.company.stateSubscription,
        simplesNacional: dto.company.isNationalSimple,
        codigoNaturezaJuridica: dto.company.legalCode,
      },
      hierarchy: dto.hierarchy && {
        owner: this.parseStringToObjectId(dto.hierarchy.ownerId),
        partner: this.parseStringToObjectId(dto.hierarchy.partnerId),
        indicator: this.parseStringToObjectId(dto.hierarchy.indicatorId),
      },
      externalControls: dto.externalControls && {
        asaas: dto.externalControls.asaas && { id: dto.externalControls.asaas.id },
        iugu: dto.externalControls.iugu && { id: dto.externalControls.iugu.id },
        arc: dto.externalControls.arc && {
          id: dto.externalControls.arc.id,
          tenants: Array.isArray(dto.externalControls.arc.tenants)
            ? dto.externalControls.arc.tenants.map((tenant: UserExternalArcTenantControl) => ({
                id: tenant.id,
                cnpj: tenant.cnpj,
              }))
            : [],
        },
      },
      webhookUrls: dto.webhookUrls,
      whenDeleteAt: dto.whenDeletedAt && new Date(dto.whenDeletedAt),
      deletedAt: dto.deletedAt && new Date(dto.deletedAt),
      isEligibleForMigration: dto.isEligibleForMigration,
      needsPasswordUpdate: dto.needsPasswordUpdate,
    };
  }

  fromSchemaToDto(schema: WithId<MUser>): UserDto {
    return {
      id: schema.id,
      email: schema.email,
      cpf: schema.cpf,
      name: schema.name,
      phoneNumber: schema.generalData?.phoneNumber1 || schema.generalData?.phoneNumber2,
      type: schema.type as UserType,
      lastLogin: schema.lastLogin?.toISOString(),
      createdAt: schema.createAt?.toISOString(),
      status: schema.status,
      creationOrigin: schema.creationOrigin as UserCreationOrigin,
      address: {
        zipCode: schema.generalData?.address?.zipcode,
        city: schema.generalData?.address?.city,
        state: schema.generalData?.address?.state,
        neighborhood: schema.generalData?.address?.neighborhood,
        street: schema.generalData?.address?.street,
        complement: schema.generalData?.address?.complement,
        number: schema.generalData?.address?.number,
      },
      billingId: this.parseObjectIdToString(schema.billing),
      partnerId: this.parseObjectIdToString(schema.partner),
      company: schema.company && {
        cnpj: schema.company.cnpj,
        socialName: schema.company.socialName,
        fantasyName: schema.company.fantasyName,
        cnae: schema.company.codigoCnae,
        stateSubscription: schema.company.stateSubscription,
        isNationalSimple: schema.company.simplesNacional,
        legalCode: schema.company.codigoNaturezaJuridica,
      },
      hierarchy: schema.hierarchy && {
        ownerId: this.parseObjectIdToString(schema.hierarchy.owner),
        partnerId: this.parseObjectIdToString(schema.hierarchy.partner),
        indicatorId: this.parseObjectIdToString(schema.hierarchy.indicator),
      },
      externalControls: {
        asaas: { id: schema.externalControls?.asaas?.id },
        iugu: { id: schema.externalControls?.iugu?.id },
        arc: {
          id: schema.externalControls?.arc?.id,
          tenants:
            schema.externalControls?.arc?.tenants?.map((tenant: MUserExternalArcTenantControlsGateway) => ({
              id: tenant.id,
              cnpj: tenant.cnpj,
            })) || [],
        },
      },
      webhookUrls: schema.webhookUrls || [],
      whenDeletedAt: schema.whenDeleteAt?.toISOString(),
      deletedAt: schema.deletedAt?.toISOString(),
      isEligibleForMigration: schema.isEligibleForMigration,
      needsPasswordUpdate: schema.needsPasswordUpdate,
    };
  }

  async getByIds(ids: ReadonlyArray<Pick<UserDto, 'id'>>): Promise<ReadonlyArray<UserDto>> {
    return this.getManyBy({
      _id: { $in: ids.map((id: Pick<UserDto, 'id'>) => this.parseStringToObjectId(id.id)) },
    });
  }

  async getByBillingId(billingId: string): Promise<UserDto | null> {
    return this.getBy({ billing: this.parseStringToObjectId(billingId) });
  }

  async getByIdWithPassword(id: string): Promise<UserDto> {
    const userDocument: MUser = await this.model.findOne({ _id: id }).lean().exec();
    const preUserDto: UserDto | null = this.normalize(userDocument);
    return preUserDto ? { ...preUserDto, password: userDocument.pass } : null;
  }

  async getByEmailWithPassword(email: string): Promise<UserDto | null> {
    const userDocument: MUser = await this.model.findOne({ email }).lean().exec();
    const preUserDto: UserDto | null = this.normalize(userDocument);
    return preUserDto ? { ...preUserDto, password: userDocument.pass } : null;
  }

  async getByEmailOrCPFWithPassword(email: string, cpf: string): Promise<UserDto | null> {
    const query: UserQueryType = email ? { email: email } : { cpf: cpf };
    const userDocument: MUser = await this.model.findOne(query).lean().exec();
    const preUserDto: UserDto | null = this.normalize(userDocument);
    return preUserDto ? { ...preUserDto, password: userDocument.pass } : null;
  }
  async getByEmail(email: string): Promise<UserDto | null> {
    return this.getBy({ email });
  }

  async getByCPF(cpf: string): Promise<UserDto | null> {
    return this.getBy({ cpf });
  }

  async getByEmailOrCPF(email: string, cpf: string): Promise<UserDto | null> {
    return this.getBy({ $or: [{ email }, { cpf }] });
  }

  async getByQueryId(queryId: string): Promise<UserDto> {
    const users: ReadonlyArray<UserDto> = await this._queryModel
      .aggregate([
        { $match: { _id: this.parseStringToObjectId(queryId) } },
        { $lookup: { from: 'musers', localField: 'user', foreignField: '_id', as: 'result' } },
        { $unwind: '$result' },
        { $replaceRoot: { newRoot: '$result' } },
      ])
      .exec();

    return this.normalize(users[0]);
  }

  async hasUserAnyImportantData(userId: string): Promise<UserDataImportance> {
    type DeleteUserAggregate = WithMongoId<MUser> & {
      readonly payments: ReadonlyArray<MPayment>;
      readonly invoices: ReadonlyArray<MInvoice>;
      readonly consumptions: ReadonlyArray<MConsumptionStatement>;
      readonly coupons: ReadonlyArray<MCoupon>;
      readonly billing: MBilling;
    };

    const aggregateUsers: ReadonlyArray<DeleteUserAggregate> = await this.model.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'mpayments',
          localField: 'billing',
          foreignField: 'billing',
          as: 'payments',
        },
      },
      {
        $lookup: {
          from: 'minvoices',
          localField: 'billing',
          foreignField: 'billing',
          as: 'invoices',
        },
      },
      {
        $lookup: {
          from: 'mconsumptionstatements',
          localField: 'billing',
          foreignField: '_id',
          as: 'consumptions',
        },
      },
      {
        $lookup: {
          from: 'mcoupons',
          localField: 'coupons',
          foreignField: '_id',
          as: 'coupons',
        },
      },
      {
        $lookup: {
          from: 'mbillings',
          localField: 'billing',
          foreignField: '_id',
          as: 'billing',
        },
      },
      { $unwind: '$billing' },
    ]);

    const userAggregate: DeleteUserAggregate = aggregateUsers[0];

    const aggregateId: string = this.parseObjectIdToString(userAggregate?._id);
    if (aggregateId !== userId) return UserDataImportance.UNKNOWN;

    return userAggregate.payments.length ||
      userAggregate.invoices.length ||
      userAggregate.consumptions.length ||
      userAggregate.coupons.length ||
      userAggregate.billing.accountFunds > 0
      ? UserDataImportance.HAS_IMPORTANT
      : UserDataImportance.HASNT_IMPORTANT;
  }

  async updateManyBy(
    users: ReadonlyArray<UserDto>,
    updateDto: Partial<UserEntity>,
    transactionReference: ClientSession,
  ): Promise<ReadonlyArray<UserDto>> {
    try {
      return this.updateMany(
        { _id: { $in: users.map((user: UserDto) => this.parseStringToObjectId(user.id)) } },
        updateDto,
        transactionReference,
      );
    } catch (error) {
      throw new Error('Error to update users');
    }
  }

  async setToDeletion(userId: string, whenDate: Date): Promise<UserEntity> {
    return this.updateById(userId, {
      status: false,
      whenDeletedAt: whenDate.toISOString(),
      deletedAt: new Date().toISOString(),
    });
  }

  cancelDeletionById(userId: string): Promise<UserEntity> {
    return this.updateById(userId, { status: true, whenDeletedAt: null, deletedAt: null });
  }

  cancelDeletionByEmail(email: string): Promise<UserEntity> {
    return this.updateBy({ email }, { status: true, whenDeletedAt: null, deletedAt: null });
  }

  async getByPaymentId(paymentId: string): Promise<UserDto | null> {
    const users: ReadonlyArray<UserDto> = await this._paymentModel
      .aggregate([
        { $match: { _id: this.parseStringToObjectId(paymentId) } },
        { $lookup: { from: 'musers', localField: 'billing', foreignField: 'billing', as: 'user' } },
        { $unwind: '$user' },
        { $replaceRoot: { newRoot: '$user' } },
      ])
      .exec();

    return this.normalize(users[0]);
  }

  async countTotalUsers(): Promise<number> {
    return this._totalUsers;
  }

  private _totalUsers: number = 0;
  @Interval(10000)
  async recountTotalUsers(): Promise<void> {
    this._totalUsers = await this.model.estimatedDocumentCount();
  }
}
