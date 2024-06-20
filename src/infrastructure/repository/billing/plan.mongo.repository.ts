import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { PlanEntity, PlanStatus } from 'src/domain/_entity/plan.entity';
import { PlanDto } from 'src/domain/_layer/data/dto/plan.dto';
import { PlanRepository } from 'src/domain/_layer/infrastructure/repository/plan.repository';
import { MPlan, MPlanDocument } from 'src/infrastructure/model/plan.model';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class PlanMongoRepository extends MongoBaseRepository<PlanDto, MPlan> implements PlanRepository<ClientSession> {
  constructor(
    @InjectModel(MPlan.name) readonly model: Model<MPlanDocument>,
    private readonly _currencyUtil: CurrencyUtil,
  ) {
    super();
    this.model = model;
  }

  fromDtoToSchema(dto: Partial<PlanEntity>): Partial<MPlan> {
    return {
      creator: this.parseStringToObjectId(dto.userId),
      status: dto.status === PlanStatus.ACTIVE ? true : false,
      state: dto.status,
      name: dto.name,
      interval: dto.intervalValue,
      intervalType: dto.intervalFrequency,
      valueCents: dto.costInCents,
      createAt: new Date(dto.createdAt),
      deactivatedAt: dto.deactivatedAt ? new Date(dto.deactivatedAt) : null,
      description: dto.description,
      textLabels: undefined, // doesnt update in mongo
      addCredits: dto.addCredits,
      badgeImage: undefined, // doesnt update in mongo
      payableWith: dto.payableWith,
      type: dto.tag,
      externalId: dto.gatewayRef,
      gateway: dto.gateway,
    };
  }

  fromSchemaToDto(schema: WithId<MPlan>): PlanEntity {
    return {
      id: schema.id,
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
      updatedAt: schema.updatedAt?.toISOString(),
    };
  }
}
