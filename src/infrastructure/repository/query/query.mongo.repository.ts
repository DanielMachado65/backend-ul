import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, Model, PipelineStage, ProjectionType } from 'mongoose';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { QueryKeysEntity } from '../../../domain/_entity/query-keys.entity';
import {
  QueryDocumentType,
  QueryEntity,
  QueryFailedService,
  QueryStackResultService,
  QueryStatus,
} from '../../../domain/_entity/query.entity';
import { QueryDto } from '../../../domain/_layer/data/dto/query.dto';
import { QueryRepository } from '../../../domain/_layer/infrastructure/repository/query.repository';
import { MQuery, MQueryDocument, MQueryFailedService, MQueryStackResultService } from '../../model/query.model';
import { MUser, MUserDocument } from '../../model/user.model';
import { DateTime } from '../../util/date-time-util.service';
import { MongoBaseRepository, PaginationToBuild, WithId } from '../mongo.repository';

@Injectable()
export class QueryMongoRepository
  extends MongoBaseRepository<QueryDto, MQuery>
  implements QueryRepository<ClientSession>
{
  constructor(
    @InjectModel(MQuery.name) readonly model: Model<MQueryDocument>,
    @InjectModel(MUser.name) readonly userModel: Model<MUserDocument>,
  ) {
    super();
    this.model = model;
    this.userModel = userModel;
  }

  fromDtoToSchema(dto: Partial<QueryDto>): Partial<MQuery> {
    return {
      createAt: dto.createdAt && new Date(dto.createdAt),
      user: this.parseStringToObjectId(dto.userId),
      documentQuery: dto.documentQuery,
      documentType: dto.documentType,
      executionTime: dto.executionTime,
      queryStatus: dto.queryStatus,
      keys: dto.queryKeys && {
        placa: dto.queryKeys.plate,
        chassi: dto.queryKeys.chassis,
        motor: dto.queryKeys.engine,
        renavam: dto.queryKeys.renavam,
        uf: dto.queryKeys.state,
        cpf: dto.queryKeys.cpf,
        cnpj: dto.queryKeys.cnpj,
        telefone: dto.queryKeys.phone,
        email: dto.queryKeys.email,
        nome: dto.queryKeys.name,
        nomeDaMae: dto.queryKeys.motherName,
        sexo: dto.queryKeys.gender,
        dataNascimento: dto.queryKeys.birthDate,
        endereco: dto.queryKeys.address && {
          cep: dto.queryKeys.address.zipCode,
          logradouro: dto.queryKeys.address.street,
          bairro: dto.queryKeys.address.neighborhood,
          cidade: dto.queryKeys.address.city,
          uf: dto.queryKeys.address.state,
          numeroDe: dto.queryKeys.address.numberStart,
          numeroAte: dto.queryKeys.address.numberEnd,
          complemento: dto.queryKeys.address.complement,
        },
      },
      refClass: dto.refClass,
      responseJSON: dto.responseJson,
      stackResult: dto.stackResult?.map((service: QueryStackResultService) => ({
        rawData: service.rawData,
        serviceLog: this.parseStringToObjectId(service.serviceLogId),
        serviceCode: service.serviceCode,
        dataFound: service.dataFound,
        hasError: service.hasError,
        supplierCode: service.supplierCode,
        serviceName: service.serviceName,
        supplierName: service.supplierName,
      })),
      failedServices: dto.failedServices?.map((service: QueryFailedService) => ({
        serviceLog: this.parseStringToObjectId(service.serviceLogId),
        serviceCode: service?.serviceCode,
        serviceName: service?.serviceName,
        supplierCode: service?.supplierCode,
        supplierName: service?.supplierName,
        requeryTries: service?.amountToRetry,
        lastTry: service.lastRetryAt ? new Date(service.lastRetryAt) : null,
      })),
      status: typeof dto.status !== 'undefined' ? dto.status === QueryStatus.SUCCESS : dto.status,
      code: dto.queryCode,
      log: this.parseStringToObjectId(dto.logId),
      reprocessedFrom: this.parseStringToObjectId(dto.reprocessedFromQueryId),
      reprocess: {
        lastTry: dto.reprocess?.lastRetryAt,
        requeryTries: dto.reprocess?.requeryTries,
      },
      version: dto.version,
      rules: dto.rules,
    };
  }

  fromSchemaToDto(schema: WithId<MQuery>): QueryDto {
    const executionTime: number | null = !isNaN(Number(schema.executionTime)) ? Number(schema.executionTime) : 0;
    const isQueryProcessing: boolean =
      !schema.status && Object.keys(schema.responseJSON || {}).length <= 0 && executionTime === 0;
    const status: QueryStatus = schema.status
      ? QueryStatus.SUCCESS
      : isQueryProcessing
      ? QueryStatus.PENDING
      : QueryStatus.FAILURE;
    return {
      id: schema.id,
      createdAt: schema.createAt?.toISOString(),
      userId: this.parseObjectIdToString(schema.user),
      documentQuery: schema.documentQuery,
      documentType: schema.documentType as QueryDocumentType,
      executionTime: schema.executionTime,
      queryStatus: schema.queryStatus,
      queryKeys: {
        plate: schema.keys?.placa,
        chassis: schema.keys?.chassi,
        engine: schema.keys?.motor,
        renavam: schema.keys?.renavam,
        state: schema.keys?.uf,
        cpf: schema.keys?.cpf,
        cnpj: schema.keys?.cnpj,
        phone: schema.keys?.telefone,
        email: schema.keys?.email,
        name: schema.keys?.nome,
        motherName: schema.keys?.nomeDaMae,
        gender: schema.keys?.sexo,
        birthDate: schema.keys?.dataNascimento,
        address: {
          zipCode: schema.keys?.endereco?.cep,
          street: schema.keys?.endereco?.logradouro,
          neighborhood: schema.keys?.endereco?.bairro,
          city: schema.keys?.endereco?.cidade,
          state: schema.keys?.endereco?.uf,
          numberStart: schema.keys?.endereco?.numeroDe,
          numberEnd: schema.keys?.endereco?.numeroAte,
          complement: schema.keys?.endereco?.complemento,
        },
      },
      refClass: schema.refClass,
      responseJson: schema.responseJSON,
      stackResult: schema.stackResult?.map((service: MQueryStackResultService) => ({
        rawData: service.rawData,
        serviceLogId: this.parseObjectIdToString(service.serviceLog),
        serviceCode: typeof service.serviceCode === 'string' ? parseInt(service.serviceCode) : service.serviceCode,
        dataFound: service.dataFound,
        hasError: service.hasError,
        supplierCode: service.supplierCode,
        serviceName: service?.serviceName,
        supplierName: service?.supplierName,
      })),
      failedServices: schema.failedServices?.map((service: MQueryFailedService) => ({
        serviceLogId: this.parseObjectIdToString(service.serviceLog),
        serviceCode: typeof service.serviceCode === 'string' ? parseInt(service.serviceCode) : service.serviceCode,
        serviceName: service.serviceName,
        supplierName: service?.supplierName,
        supplierCode: service.supplierCode,
        amountToRetry: service.requeryTries,
        lastRetryAt: service.lastTry?.toISOString(),
      })),
      status: status,
      queryCode: schema.code,
      logId: this.parseObjectIdToString(schema.log),
      reprocessedFromQueryId: this.parseObjectIdToString(schema.reprocessedFrom),
      reprocess: {
        lastRetryAt: schema.reprocess?.lastTry ?? null,
        requeryTries: schema.reprocess?.requeryTries ?? null,
      },
      version: schema.version,
      rules: schema.rules || [],
    };
  }

  async getDuplicatedQuery(
    userId: string,
    queryCode: number,
    keys: QueryKeysEntity,
    finishedFromDate: DateTime,
    processingFromDate: DateTime,
  ): Promise<QueryDto> {
    const finishedDate: Date = finishedFromDate.toDate();
    const processingDate: Date = processingFromDate.toDate();
    const plateKeyFilter: FilterQuery<MQueryDocument> = keys.plate ? { 'keys.placa': keys.plate } : {};
    const chassisFilter: FilterQuery<MQueryDocument> = keys.chassis ? { 'keys.chassi': keys.chassis } : {};
    const engineFilter: FilterQuery<MQueryDocument> = keys.engine ? { 'keys.motor': keys.engine } : {};
    const finishedFilter: FilterQuery<MQueryDocument> = {
      ...plateKeyFilter,
      ...chassisFilter,
      ...engineFilter,
      status: true,
      user: userId,
      code: queryCode,
      createAt: { $gte: finishedDate },
    };
    const processingFilter: FilterQuery<MQueryDocument> = {
      ...plateKeyFilter,
      ...chassisFilter,
      ...engineFilter,
      status: false,
      user: userId,
      code: queryCode,
      executionTime: 0,
      failedServices: { $size: 0 },
      stackResult: { $size: 0 },
      createAt: { $gte: processingDate },
    };

    return this.getBy({ $or: [finishedFilter, processingFilter] });
  }

  async getByUserId(userId: string, perPage: number, page: number, search: string): Promise<PaginationOf<QueryEntity>> {
    const regex: unknown = { $regex: '^' + search, $options: 'i' };
    const keysFilter: FilterQuery<MQueryDocument> =
      search.length > 0
        ? {
            $or: [{ 'keys.placa': regex }, { 'keys.chassi': regex }, { 'keys.motor': regex }],
          }
        : {};
    const filter: FilterQuery<MQueryDocument> = {
      $or: [
        {
          $and: [{ status: true }, { user: userId }, keysFilter],
        },
        {
          $and: [
            { status: false },
            { executionTime: 0 },
            { stackResult: { $eq: [] } },
            { failedServices: { $eq: [] } },
            { user: userId },
            keysFilter,
          ],
        },
      ],
    };
    const projection: ProjectionType<MQueryDocument> = {
      code: 1,
      status: 1,
      refClass: 1,
      responseJSON: 1,
      createdAt: 1,
      keys: 1,
      failedServices: 1,
      createAt: 1,
      documentType: 1,
      documentQuery: 1,
    };

    const count: number = await this.model.find(filter, projection).countDocuments();
    const data: ReadonlyArray<MQuery> = await this.model
      .find(filter, projection)
      .limit(perPage)
      .skip(perPage * (page - 1))
      .sort({ createAt: -1 })
      .lean()
      .exec();

    return this.normalizePagination({ data, count }, page, perPage);
  }

  async getTestDriveAndRegularQueriesByUserId(
    userId: string,
    perPage: number,
    page: number,
    search: string,
  ): Promise<PaginationOf<QueryDto>> {
    type AggregateResponseItem = { readonly count: number; readonly data: ReadonlyArray<MQuery> };
    type AggregateResponse = ReadonlyArray<AggregateResponseItem>;

    const regex: string = `^${search}`;
    const searchFilter: FilterQuery<MQueryDocument> =
      search.length > 0
        ? {
            $or: [
              { $regexMatch: { input: '$keys.placa', regex: regex, options: 'i' } },
              { $regexMatch: { input: '$keys.chassi', regex: regex, options: 'i' } },
              { $regexMatch: { input: '$keys.motor', regex: regex, options: 'i' } },
            ],
          }
        : {};
    const filter: PipelineStage.Match = {
      $match: {
        $expr: {
          $or: [
            { $and: [searchFilter, { $eq: ['$status', true] }] },
            {
              $and: [
                searchFilter,
                { $eq: ['$status', false] },
                { $eq: ['$stackResult', []] },
                { $eq: ['$failedServices', []] },
                {
                  $or: [{ $eq: ['$executionTime', 0] }, { $eq: ['$executionTime', null] }],
                },
              ],
            },
          ],
        },
      },
    };

    // eslint-disable-next-line functional/prefer-readonly-type
    const lookupPipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out | PipelineStage.Search>[] = [
      {
        $match: {
          $expr: {
            $eq: ['$user', '$$userId'],
          },
        },
      },
      filter,
      {
        $project: {
          code: 1,
          status: 1,
          refClass: 1,
          createdAt: 1,
          keys: 1,
          createAt: 1,
          documentType: 1,
          documentQuery: 1,
        },
      },
    ];

    const response: AggregateResponse = await this.userModel
      .aggregate([
        { $match: { _id: this.parseStringToObjectId(userId) } },
        {
          $lookup: {
            from: 'mqueries',
            let: { userId: '$_id' },
            as: 'queries',
            pipeline: lookupPipeline,
          },
        },
        {
          $lookup: {
            from: 'mtestdrivequeries',
            let: { userId: '$_id' },
            as: 'testDriveQueries',
            pipeline: lookupPipeline,
          },
        },
        { $project: { allQueries: { $concatArrays: ['$queries', '$testDriveQueries'] } } },
        { $unwind: '$allQueries' },
        { $replaceRoot: { newRoot: '$allQueries' } },
        { $sort: { _id: -1 } },
        { $group: { _id: 1, count: { $sum: 1 }, data: { $push: '$$ROOT' } } },
        { $project: { count: 1, data: { $slice: ['$data', perPage * (page - 1), perPage] } } },
      ])
      .exec();

    const result: PaginationToBuild<MQuery> =
      Array.isArray(response) && typeof response[0] === 'object' && response[0] !== null
        ? response[0]
        : { data: [], count: 0 };

    return this.normalizePagination(result, page, perPage);
  }
}
