import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {
  DEFAULT_SERVICE_RETRY_AMOUNT,
  QueryRules,
  QueryStatus,
  allQueryDocumentTypes,
} from '../../domain/_entity/query.entity';

export type MQueryDocument = MQuery & mongoose.Document;

@Schema({ _id: false })
export class MQueryKeysAddress {
  @Prop({ type: String, default: null })
  cep: string;

  @Prop({ type: String, default: null })
  logradouro: string;

  @Prop({ type: String, default: null })
  bairro: string;

  @Prop({ type: String, default: null })
  cidade: string;

  @Prop({ type: String, default: null })
  uf: string;

  @Prop({ type: String, default: null })
  numeroDe: string;

  @Prop({ type: String, default: null })
  numeroAte: string;

  @Prop({ type: String, default: null })
  complemento: string;
}

const mQueryKeysAddressSchema: mongoose.Schema<MQueryKeysAddress & mongoose.Document> =
  SchemaFactory.createForClass(MQueryKeysAddress);

@Schema({ _id: false })
export class MQueryKeys {
  @Prop({ type: String, default: null })
  placa: string;

  @Prop({ type: String, default: null })
  chassi: string;

  @Prop({ type: String, default: null })
  motor: string;

  @Prop({ type: String, default: null })
  renavam: string;

  @Prop({ type: String, default: null })
  uf: string;

  @Prop({ type: String, default: null })
  cpf: string;

  @Prop({ type: String, default: null })
  cnpj: string;

  @Prop({ type: String, default: null })
  telefone: string;

  @Prop({ type: String, default: null })
  email: string;

  @Prop({ type: String, default: null })
  nome: string;

  @Prop({ type: String, default: null })
  nomeDaMae: string;

  @Prop({ type: String, default: null })
  sexo: string;

  @Prop({ type: String, default: null })
  dataNascimento: string;

  @Prop({ type: mQueryKeysAddressSchema, default: new MQueryKeysAddress() })
  endereco: MQueryKeysAddress;
}

const mQueryKeysSchema: mongoose.Schema<MQueryKeys & mongoose.Document> = SchemaFactory.createForClass(MQueryKeys);

@Schema({ _id: false })
export class MQueryStackResultService {
  @Prop({ type: mongoose.Schema.Types.Mixed })
  rawData: unknown;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MServiceLog', default: null })
  /**
   * @deprecated - This field is not used anymore
   */
  serviceLog?: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  serviceCode: number;

  @Prop({ type: Boolean, default: true })
  dataFound: boolean;

  @Prop({ type: Boolean, default: false })
  hasError: boolean;

  @Prop({ type: Number, default: 0 })
  supplierCode: number;

  @Prop({ type: String, default: null })
  supplierName?: string;

  @Prop({ type: String, default: null })
  serviceName?: string;
}

const mQueryStackResultServiceSchema: mongoose.Schema<MQueryStackResultService & mongoose.Document> =
  SchemaFactory.createForClass(MQueryStackResultService);

@Schema({ _id: false })
export class MQueryFailedService {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MServiceLog', default: null })
  /**
   * @deprecated - This field is not used anymore
   */
  serviceLog?: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  serviceCode: number;

  @Prop({ type: String, default: null })
  serviceName: string;

  @Prop({ type: String, default: null })
  supplierName?: string;

  @Prop({ type: Number, default: 0 })
  supplierCode: number;

  @Prop({ type: Number, default: DEFAULT_SERVICE_RETRY_AMOUNT })
  requeryTries: number;

  @Prop({ type: Date, default: null })
  lastTry: Date;
}

const mQueryFailedServiceSchema: mongoose.Schema<MQueryFailedService & mongoose.Document> =
  SchemaFactory.createForClass(MQueryFailedService);

@Schema({ _id: false })
export class MQueryReprocess {
  @Prop({ type: Number, default: DEFAULT_SERVICE_RETRY_AMOUNT })
  requeryTries: number;

  @Prop({ type: Date, default: null })
  lastTry: Date;
}

const mQueryReprocessSchema: mongoose.Schema<MQueryReprocess & mongoose.Document> =
  SchemaFactory.createForClass(MQueryReprocess);

@Schema()
export class MQuery {
  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  user: mongoose.Types.ObjectId;

  @Prop({ type: String, default: null })
  documentQuery: string;

  @Prop({ type: String, default: null, enum: allQueryDocumentTypes })
  documentType: string;

  @Prop({ type: Number, default: 0 })
  executionTime: number;

  @Prop({ type: mQueryKeysSchema, default: new MQueryKeys() })
  keys: MQueryKeys;

  @Prop({ type: String, required: true })
  refClass: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  responseJSON: Record<string, unknown>;

  @Prop({ type: [{ type: mQueryStackResultServiceSchema }], default: [] })
  stackResult: ReadonlyArray<MQueryStackResultService>;

  @Prop({ type: [{ type: mQueryFailedServiceSchema }], default: [] })
  failedServices: ReadonlyArray<MQueryFailedService>;

  /**
   * @deprecated - Should use the queryStatus param to represent the status of the query
   */
  @Prop({ type: Boolean, default: false })
  status: boolean;

  @Prop({ type: String, enum: QueryStatus, default: QueryStatus.PENDING })
  queryStatus: QueryStatus;

  @Prop({ type: Number, required: true })
  code: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MLog', default: null })
  log: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MQuery', default: null })
  reprocessedFrom: mongoose.Types.ObjectId;

  @Prop({ type: mQueryReprocessSchema, default: new MQueryReprocess() })
  reprocess: MQueryReprocess;

  @Prop({ type: Number, default: 1 })
  version: number;

  @Prop({ type: Array, default: [] })
  rules: QueryRules[];
}

export const mQuerySchema: mongoose.Schema<MQueryDocument> = SchemaFactory.createForClass(MQuery);

export const mQueryModelDef: ModelDefinition = { name: MQuery.name, schema: mQuerySchema };
