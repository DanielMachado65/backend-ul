import { Injectable } from '@nestjs/common';
import { MongoBaseRepository, WithId } from '../mongo.repository';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { MSubscription, MSubscriptionDocument } from 'src/infrastructure/model/subscription.model';
import { ClientSession } from 'mongoose';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { Model } from 'mongoose';
import { SubscriptionEntity, SubscriptionStatus } from 'src/domain/_entity/subscription.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PlanEntity, PlanPayableWith, PlanStatus, PlanTag } from 'src/domain/_entity/plan.entity';
import { MUser, MUserDocument } from 'src/infrastructure/model/user.model';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import * as mongoose from 'mongoose';
import { MPlan } from 'src/infrastructure/model/plan.model';
import { PlanDto } from 'src/domain/_layer/data/dto/plan.dto';
import { PaginationUtil } from 'src/infrastructure/util/pagination.util';

type MSubWithPlan = MSubscription & { _id: mongoose.Types.ObjectId; plan: MPlan & { _id: mongoose.Types.ObjectId } };

@Injectable()
export class SubscriptionMongoRepository
  extends MongoBaseRepository<SubscriptionDto, MSubscription>
  implements SubscriptionRepository<ClientSession>
{
  constructor(
    @InjectModel(MSubscription.name) readonly model: Model<MSubscriptionDocument>,
    @InjectModel(MUser.name) readonly _userModel: Model<MUserDocument>,
  ) {
    super();
  }

  fromDtoToSchema(dto: Partial<SubscriptionEntity>): Partial<MSubscription & { readonly _id: unknown }> {
    return {
      _id: dto.id ? this.parseStringToObjectId(dto.id) : undefined,
      billingId: this.parseStringToObjectId(dto.billingId),
      createAt: dto.createdAt && new Date(dto.createdAt),
      creator: this.parseStringToObjectId(dto.userId),
      deactivatedAt: dto.deactivatedAt ? new Date(dto.deactivatedAt) : null,
      externalId: dto.gatewayRef,
      gateway: dto.gateway,
      ignoreNotificationBilling: dto.ignoreBillingNotification,
      payableWith: dto.paymentMethod,
      plan: this.parseStringToObjectId(dto.planId),
      planTag: dto.planTag,
      status: dto.status,
      updatedAt: dto.updatedAt && new Date(dto.updatedAt),
      expireAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      nextChargeAt: dto.nextChargeAt ? new Date(dto.nextChargeAt) : null,
    };
  }

  fromSchemaToDto(schema: WithId<MSubscription>): SubscriptionEntity {
    return {
      billingId: this.parseObjectIdToString(schema.billingId),
      createdAt: schema.createdAt?.toISOString() || schema.createAt?.toISOString(),
      deactivatedAt: schema.deactivatedAt?.toISOString() || null,
      expiresAt: schema.expireAt?.toISOString(),
      gateway: schema.gateway,
      gatewayRef: schema.externalId,
      id: schema.id.toString(),
      ignoreBillingNotification: schema.ignoreNotificationBilling,
      nextChargeAt: schema.nextChargeAt?.toISOString() || null,
      paymentIds: [],
      paymentMethod: schema.payableWith as PlanPayableWith,
      planId: this.parseObjectIdToString(schema.plan),
      planTag: schema.planTag,
      status: schema.status,
      updatedAt: schema.updatedAt?.toISOString() || schema.createdAt?.toISOString() || schema.createAt?.toISOString(),
      userId: this.parseObjectIdToString(schema.creator),
    };
  }

  fromSchemaWithPlanToDto(schema: MSubWithPlan): SubscriptionEntity & { plan: PlanDto } {
    return {
      billingId: this.parseObjectIdToString(schema.billingId),
      createdAt: schema.createdAt?.toISOString() || schema.createAt?.toISOString(),
      deactivatedAt: schema.deactivatedAt?.toISOString() || null,
      expiresAt: schema.expireAt?.toISOString(),
      gateway: schema.gateway,
      gatewayRef: schema.externalId,
      id: schema._id.toString(),
      ignoreBillingNotification: schema.ignoreNotificationBilling,
      nextChargeAt: schema.nextChargeAt?.toISOString() || null,
      paymentIds: [],
      paymentMethod: schema.payableWith as PlanPayableWith,
      planId: this.parseObjectIdToString(schema.plan),
      planTag: schema.planTag || schema.plan?.type || PlanTag.MONTHLY_CREDITS,
      status: schema.status,
      updatedAt: schema.updatedAt?.toISOString() || schema.createdAt?.toISOString() || schema.createAt?.toISOString(),
      userId: this.parseObjectIdToString(schema.creator),
      plan: this.fromPlanSchemaToPlanDto(schema.plan),
    };
  }

  fromPlanSchemaToPlanDto(schema: MPlan & { _id: mongoose.Types.ObjectId }): PlanEntity {
    return {
      id: this.parseObjectIdToString(schema._id),
      userId: this.parseObjectIdToString(schema.creator),
      name: schema.name,
      description: schema.description,
      status: schema.status ? PlanStatus.ACTIVE : PlanStatus.DEACTIVE,
      intervalValue: schema.interval,
      intervalFrequency: schema.intervalType,
      costInCents: schema.valueCents,
      addCredits: schema.addCredits,
      payableWith: schema.payableWith,
      gatewayRef: schema.externalId,
      gateway: schema.gateway,
      deactivatedAt: schema.deactivatedAt?.toISOString() || null,
      tag: schema.type,
      createdAt: schema.createdAt?.toISOString() || schema.createAt?.toISOString(),
      updatedAt: schema.updatedAt?.toISOString() || schema.createdAt?.toISOString() || schema.createAt?.toISOString(),
    };
  }

  generateNewId(): string {
    return new mongoose.Types.ObjectId().toString();
  }

  async getByIdOwnedByUser(subscriptionId: string, userId: string): Promise<SubscriptionDto> {
    const response: ReadonlyArray<MSubscription> = await this._userModel.aggregate([
      { $match: { _id: this.parseStringToObjectId(userId) } },
      {
        $lookup: {
          from: 'msubscriptions',
          localField: 'billing',
          foreignField: 'billingId',
          as: 'subscriptions',
          let: { billingId: '$billing' },
          pipeline: [
            { $match: { $expr: { $eq: ['$$billingId', '$billingId'] } } },
            { $match: { $expr: { $eq: ['$_id', this.parseStringToObjectId(subscriptionId)] } } },
          ],
        },
      },
      {
        $unwind: '$subscriptions',
      },
      {
        $replaceRoot: {
          newRoot: '$subscriptions',
        },
      },
    ]);

    return this.normalize(response[0]);
  }

  async getPaginatedOwnedByUser(
    userId: string,
    page: number,
    perPage: number,
  ): Promise<PaginationOf<SubscriptionEntity & { plan: PlanDto }>> {
    type Result = MSubscription & { _id: mongoose.Types.ObjectId; plan: MPlan & { _id: mongoose.Types.ObjectId } };
    const response: ReadonlyArray<Result> = await this._userModel.aggregate([
      { $match: { _id: this.parseStringToObjectId(userId) } },
      {
        $lookup: {
          from: 'msubscriptions',
          as: 'subscriptions',
          let: { billingId: '$billing', userId: '$_id' },
          pipeline: [
            {
              $match: {
                $or: [{ $expr: { $eq: ['$$billingId', '$billingId'] } }, { $expr: { $eq: ['$$userId', '$creator'] } }],
              },
            },
            {
              $addFields: {
                statusPriority: {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$status', SubscriptionStatus.PENDING] }, then: 1 },
                      { case: { $eq: ['$status', SubscriptionStatus.ACTIVE] }, then: 2 },
                      { case: { $eq: ['$status', SubscriptionStatus.INACTIVE] }, then: 3 },
                      { case: { $eq: ['$status', SubscriptionStatus.CANCELLING] }, then: 4 },
                      { case: { $eq: ['$status', SubscriptionStatus.CANCELED] }, then: 5 },
                    ],
                    default: 0,
                  },
                },
              },
            },
            { $sort: { statusPriority: 1, _id: 1 } },
            { $skip: perPage * (page - 1) },
            { $limit: perPage },
          ],
        },
      },
      {
        $unwind: '$subscriptions',
      },
      {
        $replaceRoot: {
          newRoot: '$subscriptions',
        },
      },
      {
        $lookup: {
          from: 'mplans',
          localField: 'plan',
          foreignField: '_id',
          as: 'plan',
        },
      },
      {
        $addFields: {
          plan: { $first: '$plan' },
        },
      },
    ]);

    return PaginationUtil.paginationFromListPage(
      response.map((res: Result) => this.fromSchemaWithPlanToDto(res)),
      page,
      perPage,
      await this.countByUserId(userId),
    );
  }

  async countByUserId(userId: string): Promise<number> {
    const response: ReadonlyArray<{ readonly total: number }> = await this._userModel
      .aggregate([
        { $match: { _id: this.parseStringToObjectId(userId) } },
        {
          $lookup: {
            from: 'msubscriptions',
            localField: 'billing',
            foreignField: 'billingId',
            as: 'subscriptions',
          },
        },
        {
          $unwind: '$subscriptions',
        },
        { $count: 'total' },
      ])
      .exec();

    return response[0]?.total || 0;
  }

  getAllByBilling(billingId: string): Promise<readonly SubscriptionEntity[]> {
    return this.getManyBy({ billingId });
  }
}
