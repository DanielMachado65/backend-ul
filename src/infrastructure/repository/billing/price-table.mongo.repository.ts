import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, Model, PipelineStage } from 'mongoose';
import { QueryComposerType } from 'src/domain/_entity/query-composer.entity';
import { QueryInfoWithoutTimestampsDto } from 'src/domain/_layer/data/dto/query-info.dto';
import { TestimonialWithoutTimestampsDto } from 'src/domain/_layer/data/dto/testimonial.dto';
import { MQueryComposer } from 'src/infrastructure/model/query-composer.model';
import { MQueryInfo } from 'src/infrastructure/model/query-info.model';
import { QueryPriceTableTemplateItem } from '../../../domain/_entity/query-price-table.entity';
import {
  DetailedPriceTableDto,
  DetailedPriceTableTemplate,
  PriceTableAvailableQueryDto,
  PriceTableDto,
  PriceTablePlanDto,
  PriceTableProductDto,
  PriceTableProductFaq,
  QueryInfoCompose,
} from '../../../domain/_layer/data/dto/price-table.dto';
import { PriceTableRepository } from '../../../domain/_layer/infrastructure/repository/price-table.repository';
import { MBilling, MBillingDocument } from '../../model/billing.model';
import { MPriceTable, MPriceTableDocument, MPriceTableTemplate } from '../../model/price-table.model';
import { Currency, CurrencyUtil } from '../../util/currency.util';
import { MongoBaseRepository, WithId, WithMongoId } from '../mongo.repository';

type DetailedTablePrice = Omit<PriceTableDto, 'template'> & {
  readonly template: ReadonlyArray<DetailedTablePriceTemplate>;
};

type WithQueryComposerType<Type> = Type & { readonly type?: QueryComposerType };

type DetailedTablePriceTemplate = MPriceTableTemplate & DetailedTablePriceQueryComposer;

type DetailedTableQueryInfo = WithMongoId<Partial<MQueryInfo>>;

type DetailedTablePriceQueryComposer = {
  readonly queryComposerDetails: WithMongoId<Partial<MQueryComposer>>;
  readonly queryInfos: ReadonlyArray<DetailedTableQueryInfo>;
};

type PriceTableProduct = {
  readonly name: string;
  readonly code: number;
  readonly exampleQuery: mongoose.Types.ObjectId;
  readonly isRecommended: boolean;
  readonly isNewFeature: boolean;
  readonly showInComparisonTable: boolean;
  readonly fullDescription: string;
  readonly shortDescription: string;
  readonly type: QueryComposerType;
  readonly faq: ReadonlyArray<PriceTableProductFaq>;
  readonly queryInfos: ReadonlyArray<QueryInfoWithoutTimestampsDto>;
  readonly testimonials: ReadonlyArray<TestimonialWithoutTimestampsDto>;
  readonly marketingPrice: number;
  readonly totalPrice: number;
  readonly buyable: boolean;
};

@Injectable()
export class PriceTableMongoRepository
  extends MongoBaseRepository<PriceTableDto, MPriceTable>
  implements PriceTableRepository<ClientSession>
{
  defaultPriceTableName: string;

  constructor(
    @InjectModel(MPriceTable.name) readonly model: Model<MPriceTableDocument>,
    @InjectModel(MBilling.name) readonly billingModel: Model<MBillingDocument>,
    private readonly _currencyUtil: CurrencyUtil,
  ) {
    super();
    this.model = model;
    this.billingModel = billingModel;
    this.defaultPriceTableName = 'default';
  }

  fromDtoToSchema(dto: PriceTableDto): MPriceTable {
    return {
      creator: this.parseStringToObjectId(dto.creatorId),
      createAt: dto.createdAt && new Date(dto.createdAt),
      name: dto.name,
      template:
        dto.template?.map((templateItem: QueryPriceTableTemplateItem) => ({
          querycode: templateItem.queryCode,
          queryComposer: this.parseStringToObjectId(templateItem.queryComposerId),
          marketingPrice:
            templateItem.marketingPriceCents &&
            this._currencyUtil.numToCurrency(templateItem.marketingPriceCents, Currency.CENTS_PRECISION).toFloat(),
          totalPrice:
            templateItem.totalPriceCents &&
            this._currencyUtil.numToCurrency(templateItem.totalPriceCents, Currency.CENTS_PRECISION).toFloat(),
          oldPrice:
            templateItem.oldPriceCents &&
            this._currencyUtil.numToCurrency(templateItem.oldPriceCents, Currency.CENTS_PRECISION).toFloat(),
        })) || [],
    };
  }

  fromSchemaToDto(schema: WithId<MPriceTable>): PriceTableDto {
    return {
      id: schema.id.toString(),
      createdAt: schema.createAt?.toISOString(),
      name: schema.name,
      creatorId: this.parseObjectIdToString(schema.creator),
      template:
        schema.template?.map((templateItem: WithQueryComposerType<WithMongoId<MPriceTableTemplate>>) => ({
          id: this.parseObjectIdToString(templateItem._id),
          queryCode: templateItem.querycode,
          type: templateItem.type,
          marketingPriceCents: this._currencyUtil.numToCurrency(templateItem.marketingPrice).toInt(),
          totalPriceCents: this._currencyUtil.numToCurrency(templateItem.totalPrice).toInt(),
          oldPriceCents: this._currencyUtil.numToCurrency(templateItem.oldPrice).toInt(),
          queryComposerId: this.parseObjectIdToString(templateItem.queryComposer),
        })) || [],
    };
  }

  async getDefaultPriceTable(): Promise<PriceTableDto | null> {
    const result: MPriceTable = await this.model.findOne({ name: this.defaultPriceTableName });
    return this.normalize(result);
  }

  private _basePriceTablePipe(userId: string): ReadonlyArray<PipelineStage> {
    return [
      { $match: { user: this.parseStringToObjectId(userId) } },
      { $lookup: { from: 'mpricetables', localField: 'priceTable', foreignField: '_id', as: 'priceTable' } },
      { $unwind: '$priceTable' },
      { $replaceRoot: { newRoot: '$priceTable' } },
      { $unwind: '$template' },
      {
        $lookup: {
          from: 'mquerycomposers',
          localField: 'template.querycode',
          foreignField: 'queryCode',
          as: 'queryComposer',
        },
      },
      { $unwind: '$queryComposer' },
      { $addFields: { 'template.type': '$queryComposer.type' } },
      { $project: { template: 1, name: 1, createAt: 1 } },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          createAt: { $first: '$createAt' },
          template: { $push: '$template' },
        },
      },
    ];
  }

  async getUserPriceTable(userId: string): Promise<PriceTableDto> {
    const documents: ReadonlyArray<WithId<MPriceTable>> = await this.billingModel.aggregate([
      ...this._basePriceTablePipe(userId),
    ]);
    return this.normalize(documents[0]);
  }

  async getPriceTable(userId?: string): Promise<PriceTableDto | null> {
    if (!userId) return this.getDefaultPriceTable();
    return this.getUserPriceTable(userId);
  }

  async getDetailedUserPriceTable(userId?: string): Promise<DetailedPriceTableDto> {
    const stages: ReadonlyArray<PipelineStage> = [
      { $unwind: '$template' },
      {
        $lookup: {
          from: 'mquerycomposers',
          localField: 'template.querycode',
          foreignField: 'queryCode',
          as: 'template.queryComposerDetails',
        },
      },
      { $unwind: '$template.queryComposerDetails' },
      {
        $lookup: {
          from: 'mqueryinfos',
          as: 'template.queryComposerDetails.queryInfos',
          let: { id: '$template.queryComposerDetails.queryInfos' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$id'] } } },
            {
              $addFields: {
                order: {
                  $cond: [
                    { $eq: ['$name', 'Dados de leilão'] },
                    0,
                    {
                      $cond: [
                        { $eq: ['$name', 'Batidas'] },
                        1,
                        {
                          $cond: [
                            { $eq: ['$name', 'Restrições e impedimentos'] },
                            2,
                            {
                              $cond: [
                                { $eq: ['$name', 'Fotos do veículo *'] },
                                3,
                                {
                                  $cond: [
                                    { $eq: ['$name', 'Roubo e furto'] },
                                    4,
                                    { $cond: [{ $eq: ['$name', 'Risco de comercialização'] }, 5, 6] },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            { $sort: { order: 1 } },
            { $unset: 'order' },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          createAt: 1,
          template: {
            querycode: 1,
            totalPrice: 1,
            marketingPrice: 1,
            _id: 1,
            queryComposerDetails: {
              id: '$template.queryComposerDetails._id',
              queryCode: '$template.queryComposerDetails.queryCode',
              status: '$template.queryComposerDetails.status',
              isRecommended: '$template.queryComposerDetails.isRecommended',
              isNewFeature: '$template.queryComposerDetails.isNewFeature',
              showInComparisonTable: '$template.queryComposerDetails.showInComparisonTable',
              fullDescription: '$template.queryComposerDetails.fullDescription',
              shortDescription: '$template.queryComposerDetails.shortDescription',
              exampleQuery: '$template.queryComposerDetails.exampleQuery',
              createAt: '$template.queryComposerDetails.createAt',
              type: '$template.queryComposerDetails.type',
              name: '$template.queryComposerDetails.name',
            },
            queryInfos: '$template.queryComposerDetails.queryInfos',
          },
        },
      },
      {
        $group: {
          _id: {
            priceTableId: '$$ROOT._id',
            name: '$$ROOT.name',
            createAt: '$$ROOT.createAt',
          },
          template: { $push: '$template' },
        },
      },
      {
        $project: {
          _id: '$_id.priceTableId',
          name: '$_id.name',
          createAt: '$_id.createAt',
          template: '$template',
        },
      },
    ];

    const documents: ReadonlyArray<DetailedTablePrice> = userId
      ? await this.billingModel.aggregate([...this._basePriceTablePipe(userId), ...stages])
      : await this.model.aggregate([{ $match: { name: this.defaultPriceTableName } }, ...stages]);

    return this._mapDetailedPriceTable(documents[0]);
  }

  async getPriceTableProducts(userId?: string): Promise<ReadonlyArray<PriceTableProductDto>> {
    const stages: ReadonlyArray<PipelineStage> = [
      {
        $unwind: '$template',
      },
      {
        $replaceRoot: {
          newRoot: '$template',
        },
      },
      {
        $lookup: {
          from: 'mquerycomposers',
          localField: 'querycode',
          foreignField: 'queryCode',
          as: 'queryComposer',
        },
      },
      {
        $unwind: '$queryComposer',
      },
      {
        $lookup: {
          from: 'mfaqs',
          localField: 'queryComposer.faq',
          foreignField: '_id',
          as: 'queryComposer.faq',
        },
      },
      {
        $lookup: {
          from: 'mqueryinfos',
          localField: 'queryComposer.queryInfos',
          foreignField: '_id',
          as: 'queryComposer.queryInfos',
        },
      },
      {
        $lookup: {
          from: 'mtestimonials',
          localField: 'queryComposer.testimonials',
          foreignField: '_id',
          as: 'queryComposer.testimonials',
        },
      },
      {
        $addFields: {
          faq: {
            $filter: {
              input: '$queryComposer.faq',
              as: 'item',
              cond: { $eq: ['$$item.deleteAt', null] },
            },
          },
          queryInfos: {
            $filter: {
              input: '$queryComposer.queryInfos',
              as: 'item',
              cond: { $eq: ['$$item.deleteAt', null] },
            },
          },
          testimonials: {
            $filter: {
              input: '$queryComposer.testimonials',
              as: 'item',
              cond: { $eq: ['$$item.deleteAt', null] },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$queryComposer.name',
          code: '$queryComposer.queryCode',
          exampleQuery: '$queryComposer.exampleQuery',
          isRecommended: '$queryComposer.isRecommended',
          isNewFeature: '$queryComposer.isNewFeature',
          showInComparisonTable: '$queryComposer.showInComparisonTable',
          title: '$queryComposer.title',
          fullDescription: '$queryComposer.fullDescription',
          shortDescription: '$queryComposer.shortDescription',
          faq: {
            $map: {
              input: '$queryComposer.faq',
              as: 'item',
              in: {
                title: '$$item.title',
                answer: '$$item.answer',
                type: '$item.type',
              },
            },
          },
          queryInfos: {
            $map: {
              input: '$queryComposer.queryInfos',
              as: 'item',
              in: {
                image: '$$item.image',
                name: '$$item.name',
                description: '$$item.description',
                isAvailable: '$$item.isAvailable',
                isAvailableToOthers: '$$item.isAvailableToOthers',
              },
            },
          },
          testimonials: {
            $map: {
              input: '$queryComposer.testimonials',
              as: 'item',
              in: {
                authorName: '$$item.authorName',
                content: '$$item.content',
                user: '$$item.user',
              },
            },
          },
          marketingPrice: '$marketingPrice',
          totalPrice: '$totalPrice',
          buyable: '$queryComposer.buyable',
          type: '$queryComposer.type',
        },
      },
      {
        $sort: {
          totalPrice: -1,
        },
      },
    ];

    const documents: ReadonlyArray<PriceTableProduct> = userId
      ? await this.billingModel.aggregate([...this._basePriceTablePipe(userId), ...stages])
      : await this.model.aggregate([{ $match: { name: this.defaultPriceTableName } }, ...stages]);

    return this._mapPriceTableProducts(documents);
  }

  async getPlans(): Promise<PriceTablePlanDto[]> {
    const plans: PriceTablePlanDto[] = await this.model.aggregate([
      {
        $match: {
          plan: {
            $ne: null,
          },
        },
      },
      {
        $unwind: {
          path: '$template',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'mquerycomposers',
          localField: 'template.querycode',
          foreignField: 'queryCode',
          as: 'queryComposer',
        },
      },
      {
        $unwind: {
          path: '$queryComposer',
          preserveNullAndEmptyArrays: false,
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
        $unwind: {
          path: '$plan',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            plan: '$plan',
            query: {
              totalPriceInCents: {
                $toInt: {
                  $multiply: [{ $toDecimal: '$template.totalPrice' }, 100],
                },
              },
              marketingPriceInCents: {
                $toInt: {
                  $multiply: [{ $toDecimal: '$template.marketingPrice' }, 100],
                },
              },
              name: '$queryComposer.name',
              queryCode: '$template.querycode',
            },
          },
        },
      },
      {
        $group: {
          _id: '$plan._id',
          plan: { $first: '$plan' },
          availableQueries: { $push: '$query' },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$plan.name',
          code: '$plan._id',
          badgeImage: '$plan.badgeImage',
          valueInCents: '$plan.valueCents',
          description: '$plan.description',
          label: {
            $arrayElemAt: ['$plan.textLabels', 1],
          },
          availableQueries: 1,
        },
      },
      {
        $sort: {
          valueInCents: 1,
        },
      },
    ]);

    const defaultPriceTable: MPriceTableDocument = await this.model.findOne({ name: 'default' }).lean();
    const defaultPrices: Record<string, number> = defaultPriceTable.template.reduce(
      (acc: Record<string, number>, query: MPriceTableTemplate) => {
        acc[query.querycode] = query.totalPrice * 100;
        return acc;
      },
      {},
    );

    return plans.map((plan: PriceTablePlanDto) => {
      const updatedAvailableQueries: PriceTableAvailableQueryDto[] = plan.availableQueries.map(
        (query: PriceTableAvailableQueryDto) => {
          return {
            ...query,
            marketingPriceInCents: defaultPrices[query.queryCode],
          };
        },
      );

      return {
        ...plan,
        availableQueries: updatedAvailableQueries,
      };
    });
  }

  private _mapQueryInfo(queryInfos: ReadonlyArray<DetailedTableQueryInfo>): ReadonlyArray<QueryInfoCompose> {
    return queryInfos.map(({ name }: DetailedTableQueryInfo) => ({ name }));
  }

  private _mapDetailedPriceTable(detailedPriceTable: DetailedTablePrice): DetailedPriceTableDto {
    const normalized: PriceTableDto = this.normalize(detailedPriceTable);

    const template: ReadonlyArray<DetailedPriceTableTemplate> = detailedPriceTable.template.map(
      (templateItem: WithMongoId<DetailedTablePriceTemplate>) => ({
        id: this.parseObjectIdToString(templateItem._id),
        querycode: templateItem.querycode,
        marketingPriceCents: this._currencyUtil.numToCurrency(templateItem.marketingPrice).toInt(),
        totalPriceCents: this._currencyUtil.numToCurrency(templateItem.totalPrice).toInt(),
        queryComposer: {
          id: this.parseObjectIdToString(templateItem.queryComposerDetails._id),
          buyable: templateItem.queryComposerDetails.buyable,
          createAt: templateItem.queryComposerDetails.createAt.toISOString(),
          exampleQuery: this.parseObjectIdToString(templateItem.queryComposerDetails.exampleQuery),
          fullDescription: templateItem.queryComposerDetails.fullDescription,
          isRecommended: templateItem.queryComposerDetails.isRecommended || false,
          isNewFeature: templateItem.queryComposerDetails.isNewFeature || false,
          name: templateItem.queryComposerDetails.name,
          queryCode: templateItem.queryComposerDetails.queryCode,
          shortDescription: templateItem.queryComposerDetails.shortDescription,
          showInComparisonTable: templateItem.queryComposerDetails.showInComparisonTable,
          status: templateItem.queryComposerDetails.status,
          type: templateItem.queryComposerDetails.type,
        },
        queryInfos: this._mapQueryInfo(templateItem.queryInfos),
      }),
    );

    return {
      ...normalized,
      template,
    };
  }

  private _mapPriceTableProducts(products: ReadonlyArray<PriceTableProduct>): ReadonlyArray<PriceTableProductDto> {
    return products.map((product: PriceTableProduct) => ({
      buyable: product.buyable,
      code: product.code,
      exampleQuery: this.parseObjectIdToString(product.exampleQuery),
      faq: product.faq.map((faqDto: PriceTableProductFaq) => ({
        title: faqDto.title,
        answer: faqDto.answer,
      })),
      fullDescription: product.fullDescription,
      isRecommended: product.isRecommended,
      isNewFeature: product.isNewFeature,
      marketingPrice: product.marketingPrice,
      name: product.name,
      queryInfos: product.queryInfos.map((queryInfo: QueryInfoWithoutTimestampsDto) => ({
        name: queryInfo.name,
        description: queryInfo.description,
        image: queryInfo.image,
        isAvailable: queryInfo.isAvailable,
        isAvailableToOthers: queryInfo.isAvailableToOthers,
      })),
      shortDescription: product.shortDescription,
      showInComparisonTable: product.showInComparisonTable,
      testimonials: product.testimonials.map((testimonial: TestimonialWithoutTimestampsDto) => ({
        authorName: testimonial.authorName,
        content: testimonial.content,
        userId: testimonial.userId,
      })),
      totalPrice: product.totalPrice,
      type: product.type,
    }));
  }
}
