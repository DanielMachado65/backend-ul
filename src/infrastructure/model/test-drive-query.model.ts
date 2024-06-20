import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { MOwnerOpinionSchema, mOwnerOpinionSchema } from 'src/infrastructure/model/owner-opinion.model';
import { TestDriveQueryStatus, allTestDriveQueryDocumentTypes } from '../../domain/_entity/test-drive-query.entity';
import { MVehicleReviewSchema, mVehicleReviewSchema } from './vehicle-review.model';

export type MTestDriveQueryDocument = MTestDriveQuery & mongoose.Document;

@Schema({ _id: false })
export class MTestDriveQueryKeys {
  @Prop({ type: String, default: null })
  placa: string;

  @Prop({ type: String, default: null })
  uf: string;
}

const mTestDriveQueryKeysSchema: mongoose.Schema<MTestDriveQueryKeys & mongoose.Document> =
  SchemaFactory.createForClass(MTestDriveQueryKeys);

@Schema({ _id: false })
export class MTestDriveQueryStackResultService {
  @Prop({ type: mongoose.Schema.Types.Mixed })
  rawData: unknown;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MServiceLog', default: null })
  serviceLog: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  serviceCode: number;

  @Prop({ type: Boolean, default: true })
  dataFound: boolean;

  @Prop({ type: Boolean, default: false })
  hasError: boolean;

  @Prop({ type: Number, default: 0 })
  supplierCode: number;
}

const mTestDriveQueryStackResultServiceSchema: mongoose.Schema<MTestDriveQueryStackResultService & mongoose.Document> =
  SchemaFactory.createForClass(MTestDriveQueryStackResultService);

@Schema({ _id: false })
export class MTestDriveQueryLog {
  @Prop({ type: String, default: null })
  error: string;
}

const mTestDriveQueryLogSchema: mongoose.Schema<MTestDriveQueryLog & mongoose.Document> =
  SchemaFactory.createForClass(MTestDriveQueryLog);

@Schema({ _id: false })
export class MTestDriveQueryUserActions {
  @Prop({ type: String, default: null })
  chosenFipeId: string;

  @Prop({ type: String, default: null })
  chosenVersion: string;
}

const mTestDriveQueryUserActionsSchema: mongoose.Schema<MTestDriveQueryUserActions & mongoose.Document> =
  SchemaFactory.createForClass(MTestDriveQueryUserActions);

@Schema({ _id: false })
export class MTestDriveQueryControl {
  @Prop({ type: String, default: null })
  requestIp: string;
}

const mTestDriveQueryControlSchema: mongoose.Schema<MTestDriveQueryControl & mongoose.Document> =
  SchemaFactory.createForClass(MTestDriveQueryControl);

@Schema({ _id: false })
export class MTestDriveBasicDataSchema {
  @Prop({ type: Number, default: null })
  anoFabricacao: number;

  @Prop({ type: Number, default: null })
  anoModelo: number;

  @Prop({ type: String, default: null })
  chassi: string;

  @Prop({ type: String, default: null })
  especie: string;

  @Prop({ type: String, default: null })
  marca: string;

  @Prop({ type: String, default: null })
  marcaModelo: string;

  @Prop({ type: String, default: null })
  modelo: string;

  @Prop({ type: Number, default: null })
  numeroDeFotos: number;

  @Prop({ type: String, default: null })
  placa: string;

  @Prop({ type: Boolean, default: false })
  possuiHistoricoKM: boolean;

  @Prop({ type: String, default: null })
  potencia: string;

  @Prop({ type: String, default: null })
  renavam: string;

  @Prop({ type: String, default: null })
  tipoVeiculo: string;
}

const mTestDriveBasicDataSchema: mongoose.Schema<MTestDriveBasicDataSchema & mongoose.Document> =
  SchemaFactory.createForClass(MTestDriveBasicDataSchema);

@Schema({ _id: false })
export class MTestDriveFipePriceHistorySchema {
  @Prop({ type: String })
  x: string;

  @Prop({ type: Number })
  y: number;
}

const mTestDriveFipePriceHistorySchema: mongoose.Schema<MTestDriveFipePriceHistorySchema & mongoose.Document> =
  SchemaFactory.createForClass(MTestDriveFipePriceHistorySchema);

@Schema({ _id: false })
export class MTestDriveDataSheetSpecSchema {
  @Prop({ type: String })
  propriedade: string;

  @Prop({ type: String })
  valor: string;
}

const mTestDriveDataSheetSpecSchema: mongoose.Schema<MTestDriveDataSheetSpecSchema & mongoose.Document> =
  SchemaFactory.createForClass(MTestDriveDataSheetSpecSchema);

@Schema({ _id: false })
export class MTestDriveDataSheetSchema {
  @Prop({ type: String })
  fipeId: string;

  @Prop({ type: Number })
  valorAtual: number;

  @Prop({ type: String })
  variacao: string;

  @Prop({ type: String })
  ref: string;

  @Prop({ type: [{ type: mTestDriveFipePriceHistorySchema }], default: [] })
  precoUltimos6Meses: ReadonlyArray<MTestDriveFipePriceHistorySchema>;

  @Prop({ type: [{ type: mTestDriveDataSheetSpecSchema }] })
  desempenho: ReadonlyArray<MTestDriveDataSheetSpecSchema>;

  @Prop({ type: [{ type: mTestDriveDataSheetSpecSchema }] })
  consumo: ReadonlyArray<MTestDriveDataSheetSpecSchema>;

  @Prop({ type: [{ type: mTestDriveDataSheetSpecSchema }] })
  geral: ReadonlyArray<MTestDriveDataSheetSpecSchema>;

  @Prop({ type: [{ type: mTestDriveDataSheetSpecSchema }] })
  transmissao: ReadonlyArray<MTestDriveDataSheetSpecSchema>;

  @Prop({ type: [{ type: mTestDriveDataSheetSpecSchema }] })
  freios: ReadonlyArray<MTestDriveDataSheetSpecSchema>;

  @Prop({ type: [{ type: mTestDriveDataSheetSpecSchema }] })
  direcao: ReadonlyArray<MTestDriveDataSheetSpecSchema>;
}

const mTestDriveDataSheetSchema: mongoose.Schema<MTestDriveDataSheetSchema & mongoose.Document> =
  SchemaFactory.createForClass(MTestDriveDataSheetSchema);

@Schema({ _id: false })
export class MTestDriveFipeVersionSchema {
  @Prop({ type: String })
  fipeId: string;

  @Prop({ type: String })
  versao: string;
}

const mTestDriveFipeVersionSchema: mongoose.Schema<MTestDriveFipeVersionSchema & mongoose.Document> =
  SchemaFactory.createForClass(MTestDriveFipeVersionSchema);

@Schema({ _id: false })
export class MTestDriveInsuranceQuoteCoverageSchema {
  @Prop({ type: String, default: null })
  type: string;

  @Prop({ type: Number, default: null })
  price: number;

  @Prop({ type: Number, default: null })
  order: number;

  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: String, default: null })
  description: string;

  @Prop({ type: Boolean, default: null })
  isIncluded: boolean;
}

const mTestDriveInsuranceQuoteCoverageSchema: mongoose.Schema<
  MTestDriveInsuranceQuoteCoverageSchema & mongoose.Document
> = SchemaFactory.createForClass(MTestDriveInsuranceQuoteCoverageSchema);

@Schema({ _id: false })
export class MTestDriveInsuranceQuoteSchema {
  @Prop({ type: String, default: null })
  externalUrl: string;

  @Prop({ type: String, default: null })
  vehicleVersion: string;

  @Prop({ type: [{ type: mTestDriveInsuranceQuoteCoverageSchema }] })
  coverages: ReadonlyArray<MTestDriveInsuranceQuoteCoverageSchema>;
}

const mTestDriveInsuranceQuoteSchema: mongoose.Schema<MTestDriveInsuranceQuoteSchema & mongoose.Document> =
  SchemaFactory.createForClass(MTestDriveInsuranceQuoteSchema);

@Schema({ _id: false })
export class MTestDriveResponseJSON {
  @Prop({ type: String, default: null })
  placa: string;

  @Prop({ type: String, default: null })
  chassi: string;

  @Prop({ type: String, default: null })
  renavam: string;

  @Prop({ type: String, default: null })
  numMotor: string;

  @Prop({ type: Number, default: null })
  codigoMarcaModelo: number;

  @Prop({ type: String, default: null })
  brandImageUrl: string;

  @Prop({ type: mTestDriveBasicDataSchema, default: new MTestDriveBasicDataSchema() })
  dadosBasicos: MTestDriveBasicDataSchema;

  @Prop({ type: [{ type: mTestDriveDataSheetSchema }], default: [] })
  fichaTecnica: ReadonlyArray<MTestDriveDataSheetSchema>;

  @Prop({ type: [{ type: mTestDriveFipeVersionSchema }], default: [] })
  versoes: ReadonlyArray<MTestDriveFipeVersionSchema>;

  @Prop({ type: mOwnerOpinionSchema, default: new MOwnerOpinionSchema() })
  opiniaoDoDono: MOwnerOpinionSchema;

  @Prop({ type: [{ type: mTestDriveInsuranceQuoteSchema }], default: [] })
  cotacaoSeguro: ReadonlyArray<MTestDriveInsuranceQuoteSchema>;

  @Prop({ type: mVehicleReviewSchema, default: null })
  avaliacaoVeicular: MVehicleReviewSchema;
}

const mTestDriveQueryResponseJSONSchema: mongoose.Schema<MTestDriveResponseJSON & mongoose.Document> =
  SchemaFactory.createForClass(MTestDriveResponseJSON);

@Schema({ _id: false })
export class MTestDriveQueryFailedService {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MServiceLog', default: null })
  serviceLog: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  serviceCode: number;

  @Prop({ type: String, default: null })
  serviceName: string;

  @Prop({ type: Number, default: 0 })
  supplierCode: number;
}

const mTestDriveQueryFailedServiceSchema: mongoose.Schema<MTestDriveQueryFailedService & mongoose.Document> =
  SchemaFactory.createForClass(MTestDriveQueryFailedService);

@Schema()
export class MTestDriveQuery {
  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  user: mongoose.Types.ObjectId;

  @Prop({ type: String, default: null })
  documentQuery: string;

  @Prop({ type: String, default: null, enum: allTestDriveQueryDocumentTypes })
  documentType: string;

  @Prop({ type: String, default: null })
  executionTime: string;

  @Prop({ type: mTestDriveQueryKeysSchema, default: new MTestDriveQueryKeys() })
  keys: MTestDriveQueryKeys;

  @Prop({ type: String, required: true })
  refClass: string;

  @Prop({ type: mTestDriveQueryResponseJSONSchema })
  responseJSON: MTestDriveResponseJSON;

  @Prop({ type: [{ type: mTestDriveQueryStackResultServiceSchema }], default: [] })
  stackResult: ReadonlyArray<MTestDriveQueryStackResultService>;

  @Prop({ type: [{ type: mTestDriveQueryFailedServiceSchema }], default: [] })
  failedServices: ReadonlyArray<MTestDriveQueryFailedService>;

  @Prop({ type: [{ type: String }], default: [] })
  servicesToReprocess: ReadonlyArray<string>;

  /**
   * @deprecated - Should use the queryStatus param to represent the status of the query
   */
  @Prop({ type: Boolean, default: false })
  status: boolean;

  @Prop({ type: String, enum: TestDriveQueryStatus, default: TestDriveQueryStatus.PENDING })
  queryStatus: TestDriveQueryStatus;

  @Prop({ type: Number, required: true })
  code: number;

  @Prop({ type: mTestDriveQueryLogSchema, default: new MTestDriveQueryLog() })
  log: MTestDriveQueryLog;

  @Prop({ type: mTestDriveQueryUserActionsSchema, default: new MTestDriveQueryUserActions() })
  userActions: MTestDriveQueryUserActions;

  @Prop({ type: mTestDriveQueryControlSchema, default: new MTestDriveQueryControl() })
  control: MTestDriveQueryControl;
}

export const mTestDriveQuerySchema: mongoose.Schema<MTestDriveQueryDocument> =
  SchemaFactory.createForClass(MTestDriveQuery);

export const mTestDriveQueryModelDef: ModelDefinition = { name: MTestDriveQuery.name, schema: mTestDriveQuerySchema };
