import * as mongoose from 'mongoose';
import {
  ClientSession,
  Document,
  FilterQuery,
  HydratedDocument,
  MergeType,
  Model,
  QueryOptions,
  SaveOptions,
  UpdateQuery,
} from 'mongoose';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { IBaseRepository } from '../../domain/_layer/infrastructure/repository/base.repository';
import { PaginationUtil } from '../util/pagination.util';

export type WithId<Value> = { readonly id: string } & Value;

export type WithMongoId<Value> = { readonly _id: mongoose.Types.ObjectId; readonly __v: string } & Value;

export type PaginationToBuild<Schema> = {
  readonly data: ReadonlyArray<Schema>;
  readonly count: number;
};

export abstract class MongoBaseRepository<Dto, Schema> implements IBaseRepository<Dto, ClientSession> {
  abstract readonly model: Model<Schema & Document>;

  abstract fromDtoToSchema(dto: Partial<Dto>): Partial<Schema>;

  abstract fromSchemaToDto(schema: WithId<Schema>): Dto;

  removePartialKeys(schema: Partial<Schema>): Partial<Schema> {
    return Object.keys(schema).reduce((acc: Partial<Schema>, key: string) => {
      if (typeof schema[key] !== 'undefined' && schema[key] !== null) return { ...acc, [key]: schema[key] };
      return acc;
    }, {});
  }

  surgicalOperation(obj: Partial<Schema>, pathPrefix: string = ''): Partial<Schema> {
    const prefix: string = pathPrefix ? pathPrefix + '.' : '';

    return Object.keys(obj).reduce((acc: Partial<Schema>, key: string) => {
      const value: unknown = obj[key];
      const valueType: string = typeof value;
      const isFunction: boolean = valueType === 'function';
      const isSymbol: boolean = valueType === 'symbol';

      if (isFunction || isSymbol) return acc;

      const isObject: boolean = typeof value === 'object';
      const isObjectId: boolean = isObject && value instanceof mongoose.Types.ObjectId;
      const isDate: boolean = isObject && value instanceof Date;
      const isRegex: boolean = isObject && value instanceof RegExp;
      const isNull: boolean = isObject && !value;
      const isArray: boolean = Array.isArray(value);
      const keyPath: string = String(prefix + key);

      if (!isObject || isObjectId || isDate || isRegex || isNull || isArray) return { ...acc, [keyPath]: value };

      return { ...acc, ...this.surgicalOperation(value as Partial<Schema>, keyPath) };
    }, {});
  }

  normalizePagination(
    result: PaginationToBuild<Schema> | null,
    page: number,
    perPage: number,
  ): PaginationOf<Dto> | null {
    const data: ReadonlyArray<Dto> = result ? this.normalizeArray(result.data) : [];
    return PaginationUtil.paginationFromListPage(data, page, perPage, result.count);
  }

  normalizeArray(result: ReadonlyArray<unknown> | null): ReadonlyArray<Dto> {
    if (!result && !Array.isArray(result)) return [];
    const verifiedResult: ReadonlyArray<Schema> = result as ReadonlyArray<Schema>;

    return verifiedResult.map(this.normalize.bind(this));
  }

  normalize(result: unknown | null): Dto | null {
    if (!result) return null;

    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-unused-vars
    const { _id, __v, ...data }: WithMongoId<Schema> = result as WithMongoId<Schema>;
    const normalizedResult: WithId<Schema> = {
      ...data,
      id: this.parseObjectIdToString(_id),
    } as unknown as WithId<Schema>;
    return this.fromSchemaToDto(normalizedResult);
  }

  parseObjectIdToString(id?: mongoose.Types.ObjectId): string | undefined {
    return id && id.toString();
  }

  parseStringToObjectId(id?: string): mongoose.Types.ObjectId | undefined {
    return id && new mongoose.Types.ObjectId(id);
  }

  async getBy(filter: FilterQuery<Schema & Document>): Promise<Dto | null> {
    const result: Document = await this.model.findOne(filter).lean().exec();
    return this.normalize(result);
  }

  async getManyBy(filter: FilterQuery<Schema & Document>): Promise<ReadonlyArray<Dto>> {
    const results: ReadonlyArray<Document> = await this.model.find(filter).lean().exec();
    return results.map(this.normalize.bind(this));
  }

  async updateBy(
    filter: FilterQuery<Schema & Document>,
    updateDto: Partial<Dto>,
    transactionReference: ClientSession = null,
  ): Promise<Dto | null> {
    const options: QueryOptions = { new: true, runValidators: true, session: transactionReference };
    const updateQuery: Partial<Schema> = this.fromDtoToSchema(updateDto);
    const partialQuery: UpdateQuery<Schema & Document> = this.removePartialKeys(this.surgicalOperation(updateQuery));
    const result: Document = await this.model.findOneAndUpdate(filter, partialQuery, options).lean().exec();
    return this.normalize(result);
  }

  async updateMany(
    filter: FilterQuery<Schema & Document>,
    updateDto: Partial<Dto>,
    transactionReference: ClientSession = null,
  ): Promise<ReadonlyArray<Dto>> {
    const options: QueryOptions = { runValidators: true };
    const updateQuery: Partial<Schema> = this.fromDtoToSchema(updateDto);
    const partialQuery: UpdateQuery<Schema & Document> = this.removePartialKeys(this.surgicalOperation(updateQuery));

    const response: mongoose.UpdateWriteOpResult = await this.model
      .updateMany(filter, partialQuery, options)
      .session(transactionReference)
      .lean()
      .exec();

    if (!response.acknowledged) return [];

    const results: ReadonlyArray<Document> = await this.model.find(filter).lean().exec();
    return results.map(this.normalize.bind(this));
  }

  async removeBy(
    filter: FilterQuery<Schema & Document>,
    transactionReference: ClientSession = null,
  ): Promise<Dto | null> {
    const options: QueryOptions = { session: transactionReference };
    const result: Document = await this.model.findOneAndDelete(filter, options);
    return this.normalize(result);
  }

  getById(id: string): Promise<Dto | null> {
    return this.getBy({ _id: id } as FilterQuery<Schema & Document>);
  }

  removeById(id: string, transactionReference?: ClientSession): Promise<Dto | null> {
    return this.removeBy({ _id: id } as FilterQuery<Schema & Document>, transactionReference);
  }

  async insert(inputDto: Partial<Dto>, transactionReference?: ClientSession): Promise<Dto | null> {
    const documents: ReadonlyArray<Dto> = await this.insertMany([inputDto], transactionReference);
    return documents[0] || null;
  }

  async insertMany(
    inputs: ReadonlyArray<Partial<Dto>>,
    transactionReference?: ClientSession,
  ): Promise<ReadonlyArray<Dto>> {
    type Doc = MergeType<HydratedDocument<unknown, unknown>, Omit<ReadonlyArray<Partial<Schema>>, '_id'>>;

    const options: SaveOptions = { session: transactionReference };
    const schemas: ReadonlyArray<Partial<Schema>> = inputs.map((input: Partial<Dto>) => {
      return this.removePartialKeys(this.surgicalOperation(this.fromDtoToSchema(input)));
    });
    const documents: ReadonlyArray<Doc> = (await this.model.insertMany(
      [...schemas],
      options,
    )) as unknown as ReadonlyArray<Doc>;
    return documents.map((document: Doc) => {
      return this.normalize(document.toJSON({ getters: true, virtuals: false }));
    });
  }

  async updateById(
    id: string,
    updateDto: Partial<Dto>,
    transactionReference: ClientSession = null,
  ): Promise<Dto | null> {
    return this.updateBy({ _id: id } as FilterQuery<Schema & Document>, updateDto, transactionReference);
  }

  async count(): Promise<number> {
    return this.model.estimatedDocumentCount().exec();
  }
}
