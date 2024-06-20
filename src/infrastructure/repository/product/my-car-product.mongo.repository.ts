import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, FilterQuery, Model, PipelineStage, SortOrder } from 'mongoose';

import {
  MyCarProductEntity,
  MyCarProductStatusEnum,
  MyCarProductTypeEnum,
} from 'src/domain/_entity/my-car-product.entity';
import { QueryKeys } from 'src/domain/_entity/query.entity';

import { MyCarProductDto, MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import {
  GetByCarIdOptions,
  ListMyCarPaginatedFilters,
  MyCarProductRepository,
  MyCarRepresentation1,
} from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { MMyCarProduct, MMyCarProductDocument } from 'src/infrastructure/model/my-car-product.model';
import { MUser, MUserDocument } from 'src/infrastructure/model/user.model';
import { PaginationUtil } from 'src/infrastructure/util/pagination.util';
import { MongoBaseRepository, PaginationToBuild, WithId } from '../mongo.repository';

@Injectable()
export class MyCarProductMongoRepository
  extends MongoBaseRepository<MyCarProductDto, MMyCarProduct>
  implements MyCarProductRepository<ClientSession>
{
  constructor(
    @InjectModel(MMyCarProduct.name) readonly model: Model<MMyCarProductDocument>,
    @InjectModel(MUser.name) private readonly _userModel: Model<MUserDocument>,
  ) {
    super();
    this.model = model;
  }

  async getBySubscriptionId(subscriptionId: string): Promise<MyCarProductEntity> {
    const response: MyCarProductEntity = await this.getBy({
      subscriptionId: subscriptionId,
    });
    return response;
  }

  fromDtoToSchema(dto: Partial<MyCarProductEntity>): Partial<MMyCarProduct> {
    return {
      billingId: this.parseStringToObjectId(dto.billingId),
      subscriptionId: this.parseStringToObjectId(dto.subscriptionId),
      type: dto.type,
      status: dto.status,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      deactivatedAt: dto.deactivatedAt ? new Date(dto.deactivatedAt) : null,
      deletedAt: dto.deletedAt ? new Date(dto.deletedAt) : null,
      revisionConfig: dto.revisionConfig && {
        isEnabled: dto.revisionConfig.isEnabled,
        notificationChannels: dto.revisionConfig.notificationChannels,
        mileageKm: dto.revisionConfig.mileageKm,
        mileageKmMonthly: dto.revisionConfig.mileageKmMonthly,
        shouldNotify7DaysBefore: dto.revisionConfig.shouldNotify7DaysBefore,
        shouldNotify15DaysBefore: dto.revisionConfig.shouldNotify15DaysBefore,
        shouldNotify30DaysBefore: dto.revisionConfig.shouldNotify30DaysBefore,
      },
      onQueryConfig: dto.onQueryConfig && {
        isEnabled: dto.onQueryConfig.isEnabled,
        notificationChannels: dto.onQueryConfig.notificationChannels,
      },
      priceFIPEConfig: dto.priceFIPEConfig && {
        isEnabled: dto.priceFIPEConfig.isEnabled,
        notificationChannels: dto.priceFIPEConfig.notificationChannels,
      },
      fineConfig: dto.fineConfig && {
        isEnabled: dto.fineConfig.isEnabled,
        notificationChannels: dto.fineConfig.notificationChannels,
      },
      keys: dto.keys,
    };
  }

  fromSchemaToDto(schema: WithId<MMyCarProduct>): MyCarProductEntity {
    return {
      id: schema.id,
      billingId: this.parseObjectIdToString(schema.billingId),
      subscriptionId: this.parseObjectIdToString(schema.subscriptionId),
      type: schema.type,
      status: schema.status,
      expiresAt: schema.expiresAt?.toISOString() || null,
      deactivatedAt: schema.deactivatedAt?.toISOString() || null,
      deletedAt: schema.deletedAt?.toISOString() || null,
      revisionConfig: schema.revisionConfig,
      onQueryConfig: schema.onQueryConfig,
      priceFIPEConfig: schema.priceFIPEConfig,
      fineConfig: schema.fineConfig,
      keys: schema.keys,
      createdAt: schema.createdAt?.toISOString(),
      updatedAt: schema.updatedAt?.toISOString(),
    };
  }

  private _fitlerOptions(options: GetByCarIdOptions, response: MyCarProductWithUserDto): MyCarProductWithUserDto {
    if (options.only) {
      const keys: ReadonlyArray<string> = Object.keys(response);

      keys.forEach((key: string) => {
        if (Array.isArray(options.only) && !options.only.includes(key)) {
          delete response[key];
        }
      });
    }

    return response;
  }

  private _formatIncludes(includes: ReadonlyArray<string>, record: string): Record<string, unknown> {
    return includes.reduce((acc: Record<string, unknown>, include: string) => {
      acc[include] = `${record}.${include}`;
      return acc;
    }, {} as Record<string, unknown>);
  }

  async getAll(
    page: number,
    perPage: number,
    filterOptions?: FilterQuery<MMyCarProductDocument>,
    sortOptions?: Record<string, SortOrder>,
  ): Promise<PaginationOf<MyCarProductDto>> {
    const query: FilterQuery<MMyCarProductDocument> = {
      deletedAt: null,
      deactivatedAt: null,
      ...filterOptions,
    };

    try {
      const [data, total]: readonly [readonly MMyCarProductDocument[], number] = await Promise.all([
        this.model
          .find(query)
          .sort(sortOptions || {})
          .skip(perPage * (page - 1))
          .limit(perPage)
          .exec(),
        this.model.countDocuments(query),
      ]);

      const result: PaginationToBuild<MMyCarProduct> = {
        data: data.map((schema: MMyCarProductDocument) => schema.toObject()),
        count: total,
      };

      return this.normalizePagination(result, page, perPage);
    } catch (error) {
      console.error('Error fetching MyCarProduct entities:', error);
      throw error;
    }
  }

  async getAllIncludeUser(
    filterOptions?: FilterQuery<MMyCarProductDocument>,
  ): Promise<readonly MyCarProductWithUserDto[]> {
    const matchStage: { readonly $match: FilterQuery<Document> } = {
      $match: { ...filterOptions, deletedAt: null, deactivatedAt: null },
    };
    const lookupStage: {
      readonly $lookup: {
        readonly from: string;
        readonly localField: string;
        readonly foreignField: string;
        readonly as: string;
      };
    } = {
      $lookup: {
        from: 'musers',
        localField: 'billingId',
        foreignField: 'billing',
        as: 'user',
      },
    };
    const unwindStage: { readonly $unwind: string } = { $unwind: '$user' };

    const projectionStage: { readonly $project: Record<string, unknown> } = {
      $project: {
        _id: 0,
        userId: '$user._id',
        billingId: '$user.billing',
        carId: '$_id',
        name: '$user.name',
        email: '$user.email',
        type: '$type',
        status: '$status',
        keys: '$keys',
        onQueryConfig: '$onQueryConfig',
        revisionConfig: '$revisionConfig',
        fineConfig: '$fineConfig',
        priceFIPEConfig: '$priceFIPEConfig',
      },
    };

    // eslint-disable-next-line functional/prefer-readonly-type
    const aggregationPipeline: PipelineStage[] = [matchStage, lookupStage, unwindStage, projectionStage];

    try {
      const data: readonly MyCarProductWithUserDto[] = await this.model.aggregate(aggregationPipeline).exec();

      return data;
    } catch (error) {
      console.error('Error in getAllIncludeUser:', error);
      throw error;
    }
  }

  async getByUserIdAndCarId(
    userId: string,
    carId: string,
    options?: GetByCarIdOptions,
  ): Promise<MyCarProductWithUserDto> {
    const response: ReadonlyArray<MyCarProductWithUserDto> = await this._userModel
      .aggregate([
        { $match: { _id: this.parseStringToObjectId(userId) } },
        {
          $lookup: {
            from: 'mmycarproducts',
            let: { billingId: '$billing' },
            as: 'mmycarproduct',
            pipeline: [
              { $match: { $expr: { $eq: ['$$billingId', '$billingId'] } } },
              { $match: { _id: this.parseStringToObjectId(carId) } },
            ],
          },
        },
        { $unwind: '$mmycarproduct' },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            email: '$email',
            name: '$name',
            carId: '$mmycarproduct._id',
            status: '$mmycarproduct.status',
            keys: '$mmycarproduct.keys',
            type: '$mmycarproduct.type',
            onQueryConfig: '$mmycarproduct.onQueryConfig',
            priceFIPEConfig: '$mmycarproduct.priceFIPEConfig',
            ...(options?.includes ? this._formatIncludes(options.includes, '$mmycarproduct') : {}),
          },
        },
      ])
      .exec();

    if (options) return this._fitlerOptions(options, response[0]);

    return response[0] ?? null;
  }

  async getByBillingId(billingId: string): Promise<MyCarProductEntity> {
    const response: MyCarProductEntity = await this.getBy({
      billingId: this.parseStringToObjectId(billingId),
    });
    return response;
  }

  async countByUserId(userId: string, onlyStatuses: ReadonlyArray<MyCarProductStatusEnum> = []): Promise<number> {
    const statusPipe: ReadonlyArray<Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>> =
      onlyStatuses.length ? [{ $match: { status: { $in: onlyStatuses } } }] : [];
    const response: ReadonlyArray<{ readonly total: number }> = await this._userModel
      .aggregate([
        { $match: { _id: this.parseStringToObjectId(userId) } },
        { $project: { billing: 1 } },
        {
          $lookup: {
            from: 'mmycarproducts',
            localField: 'billing',
            foreignField: 'billingId',
            as: 'mmycarproduct',
            pipeline: [...statusPipe],
          },
        },
        { $unwind: '$mmycarproduct' },
        { $count: 'total' },
      ])
      .exec();

    return response[0]?.total || 0;
  }

  async getByIdAndBillingId(id: string, billingId: string): Promise<MyCarProductEntity> {
    return await this.getBy({
      $and: [{ _id: this.parseStringToObjectId(id) }, { billingId: this.parseStringToObjectId(billingId) }],
    });
  }

  async getByIdOwnedByUser(myCarId: string, userId: string): Promise<MyCarProductDto> {
    const response: ReadonlyArray<MMyCarProduct> = await this._userModel.aggregate([
      { $match: { _id: this.parseStringToObjectId(userId) } },
      {
        $lookup: {
          from: 'mmycarproducts',
          localField: 'billing',
          foreignField: 'billingId',
          as: 'mycars',
          let: { billingId: '$billing' },
          pipeline: [
            { $match: { $expr: { $eq: ['$$billingId', '$billingId'] } } },
            { $match: { $expr: { $eq: ['$_id', this.parseStringToObjectId(myCarId)] } } },
          ],
        },
      },
      {
        $unwind: '$mycars',
      },
      {
        $replaceRoot: {
          newRoot: '$mycars',
        },
      },
    ]);

    return this.normalize(response[0]);
  }

  async listByUserId(
    userId: string,
    page: number,
    perPage: number,
    onlyStatuses: ReadonlyArray<MyCarProductStatusEnum> = [],
  ): Promise<PaginationOf<MyCarProductDto>> {
    const statusPipe: ReadonlyArray<Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>> =
      onlyStatuses.length ? [{ $match: { status: { $in: onlyStatuses } } }] : [];
    const response: ReadonlyArray<MMyCarProduct> = await this._userModel.aggregate([
      { $match: { _id: this.parseStringToObjectId(userId) } },
      {
        $lookup: {
          from: 'mmycarproducts',
          let: { billingId: '$billing' },
          as: 'mmycarproduct',
          pipeline: [
            { $match: { $expr: { $eq: ['$$billingId', '$billingId'] } } },
            ...statusPipe,
            { $sort: { _id: 1 } },
            { $skip: perPage * (page - 1) },
            { $limit: perPage },
          ],
        },
      },
      { $unwind: '$mmycarproduct' },
      { $replaceRoot: { newRoot: '$mmycarproduct' } },
    ]);

    const result: PaginationToBuild<MMyCarProduct> = {
      data: response,
      count: await this.countByUserId(userId, onlyStatuses),
    };

    return this.normalizePagination(result, page, perPage);
  }

  async hasActiveProduct(userId: string, fipeId: string, plate: string): Promise<boolean> {
    const response: ReadonlyArray<MMyCarProduct> = await this._userModel.aggregate([
      { $match: { _id: this.parseStringToObjectId(userId) } },
      {
        $lookup: {
          from: 'mmycarproducts',
          localField: 'billing',
          foreignField: 'billingId',
          as: 'mycars',
          let: { billingId: '$billing' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$$billingId', '$billingId'] },
                    { $eq: ['$keys.fipeId', fipeId] },
                    { $eq: ['$keys.plate', plate] },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $unwind: '$mycars',
      },
      {
        $replaceRoot: {
          newRoot: '$mycars',
        },
      },
      { $match: { $or: [{ status: { $eq: 'active' } }] } },
    ]);

    return Array.isArray(response) && response.length > 0;
  }

  async getActiveByKeys(userId: string, keys: Partial<QueryKeys>): Promise<ReadonlyArray<MyCarProductWithUserDto>> {
    return this.model.aggregate([
      { $match: { $and: [{ type: MyCarProductTypeEnum.PREMIUM }, { status: MyCarProductStatusEnum.ACTIVE }] } },
      {
        $match: {
          $or: [
            { 'keys.plate': keys.plate || null },
            { 'keys.chassis': keys.chassis || null },
            { 'keys.engine': keys.engine || null },
            { 'keys.fipeId': keys.fipeId || null },
          ],
        },
      },
      {
        $lookup: {
          from: 'musers',
          localField: 'billingId',
          foreignField: 'billing',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$user._id',
          billingId: '$user.billing',
          carId: '$_id',
          name: '$user.name',
          email: '$user.email',
          userUF: '$user.generalData.address.state',
          type: '$type',
          status: '$status',
          keys: '$keys',
          onQueryConfig: '$onQueryConfig',
          priceFIPEConfig: '$priceFIPEConfig',
        },
      },
      { $match: { userId: { $ne: this.parseStringToObjectId(userId) } } },
    ]);
  }

  async listPaginatedMyCars(
    page: number,
    perPage: number,
    { email, subscriptionId, myCarId, plate }: ListMyCarPaginatedFilters,
  ): Promise<PaginationOf<MyCarRepresentation1>> {
    type Agg = {
      id: mongoose.Types.ObjectId;
      subscriptionId: mongoose.Types.ObjectId;
      email: string;
      userId: mongoose.Types.ObjectId;
      plate: string;
      activationDate: Date;
      cancellationDate: Date;
      status: string;
      revisionConfig: unknown;
      onQueryConfig: unknown;
      priceFIPEConfig: unknown;
      fineConfig: unknown;
    };

    const matchStep: Record<string, unknown> = {};
    if (email) matchStep['users.0.email'] = email;
    if (subscriptionId) matchStep.subscriptionId = this.parseStringToObjectId(subscriptionId);
    if (myCarId) matchStep._id = this.parseStringToObjectId(myCarId);
    if (plate) matchStep['keys.plate'] = plate;

    const documents: Agg[] = await this.model.aggregate([
      {
        $lookup: {
          from: 'musers',
          localField: 'billingId',
          foreignField: 'billing',
          as: 'users',
        },
      },
      {
        $match: matchStep,
      },
      { $sort: { _id: -1 } },
      { $skip: perPage * (page - 1) },
      { $limit: perPage },
      {
        $addFields: {
          id: '$_id',
          user: { $first: '$users' },
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          subscriptionId: 1,
          email: '$user.email',
          userId: '$user._id',
          plate: '$keys.plate',
          activationDate: '$createdAt',
          cancellationDate: '$deactivatedAt',
          status: '$status',
          revisionConfig: 1,
          onQueryConfig: 1,
          priceFIPEConfig: 1,
          fineConfig: 1,
        },
      },
    ]);

    const count: number = await this.model.estimatedDocumentCount();

    // return this.normalizePagination({ data: documents, count }, page, perPage);
    return PaginationUtil.paginationFromListPage(
      documents.map((myCar: Agg) => ({
        id: this.parseObjectIdToString(myCar.id),
        subscriptionId: this.parseObjectIdToString(myCar.subscriptionId),
        email: myCar.email,
        userId: this.parseObjectIdToString(myCar.userId),
        plate: myCar.plate,
        activationDate: myCar.activationDate?.toISOString() || null,
        cancellationDate: myCar.cancellationDate?.toISOString() || null,
        status: myCar.status,
        revisionConfig: myCar.revisionConfig,
        onQueryConfig: myCar.onQueryConfig,
        priceFIPEConfig: myCar.priceFIPEConfig,
        fineConfig: myCar.fineConfig,
      })),
      page,
      perPage,
      count,
    );
  }
}
