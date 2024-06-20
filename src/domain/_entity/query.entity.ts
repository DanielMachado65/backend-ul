import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { QueryInsuranceQuoteVo } from 'src/domain/value-object/query/query-insurance-quote.vo';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export const DEFAULT_SERVICE_RETRY_AMOUNT: number = 2;

export enum QueryDocumentType {
  PLATE = 'PLACA',
  CHASSIS = 'CHASSI',
  ENGINE = 'MOTOR',
  CPF = 'CPF',
  CNPJ = 'CNPJ',
}

export const allQueryDocumentTypes: ReadonlyArray<QueryDocumentType> = [
  QueryDocumentType.PLATE,
  QueryDocumentType.CHASSIS,
  QueryDocumentType.ENGINE,
  QueryDocumentType.CPF,
  QueryDocumentType.CNPJ,
];

export enum QueryStatus {
  SUCCESS = 'success',
  PARTIAL = 'partial',
  PENDING = 'pending',
  FAILURE = 'failure',
  EXPIRED = 'expired',
  REPROCESSING = 'reprocessing',
}

export enum QueryRules {
  HIDE_ADS = 'HIDE_ADS',
}

export type QueryDebitsContent = {
  readonly valorTotalEmCentavos: number;
};

export type QueryDebitsData = {
  readonly noDebts: boolean;
  readonly debitos: ReadonlyArray<QueryDebitsContent>;
};

export type FipeInformationData = {
  readonly historicoPreco: unknown;
  readonly valorAtual: unknown;
  readonly combustivel: unknown;
  readonly fipeId: number;
  readonly marca: string;
  readonly modelo: string;
  readonly versao: string;
  readonly ano: number;
};

export type BasicDataData = {
  readonly informacoesFipe?: ReadonlyArray<FipeInformationData>;
  readonly anoFabricacao: number;
  readonly anoModelo: number;
};

export type QueryRevisionItemRecordChangedPart = {
  readonly descricao: string;
  readonly quantidade: number;
};

export type QueryRevisionItemRecordsData = {
  readonly kilometragem: number;
  readonly meses: number;
  readonly parcelas: number;
  readonly duracaoEmMinutos: number;
  readonly precoTotal: number;
  readonly precoParcela: number;
  readonly pecasTrocadas: ReadonlyArray<QueryRevisionItemRecordChangedPart>;
  readonly inspecoes: ReadonlyArray<string>;
};

export type QueryRevisionItemData = {
  readonly fipeId: number;
  readonly idVersao: number;
  readonly registros: ReadonlyArray<QueryRevisionItemRecordsData>;
};

export type QueryRevisionData = {
  readonly veiculosFipe: ReadonlyArray<QueryRevisionItemData>;
};

export type QueryResponseJson = Record<string, unknown> & {
  readonly placa?: string;
  readonly chassi?: string;
  readonly marca?: string;
  readonly modelo?: string;
  readonly marcaImagem?: string;
  readonly debitosMultas?: QueryDebitsData;
  readonly cotacaoSeguro?: QueryInsuranceQuoteVo;
  readonly dadosBasicosDoVeiculo?: BasicDataData;
  readonly revisao?: QueryRevisionData;
  readonly codigoMarcaModelo?: string;
};

export class QueryKeysAddress {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  street?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  city?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  state?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  numberStart?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  numberEnd?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  complement?: string;
}

export class QueryKeys {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Matches(/^[A-Za-z]{3}\d[A-Ja-j0-9]\d{2}$/)
  plate?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  chassis?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  engine?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  renavam?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  state?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  cpf?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  cnpj?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  motherName?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  gender?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  birthDate?: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  @Type(() => QueryKeysAddress)
  address?: QueryKeysAddress;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fipeId?: string;
}

export class QueryStackResultService {
  @ApiProperty()
  @IsOptional()
  rawData: unknown;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  /**
   * @deprecated - This field is not used anymore
   */
  serviceLogId?: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  serviceCode: number;

  @ApiProperty()
  @IsBoolean()
  dataFound: boolean;

  @ApiProperty()
  @IsBoolean()
  hasError: boolean;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  supplierCode: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  supplierName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  serviceName?: string;
}

export class QueryFailedService {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  /**
   * @deprecated - This field is not used anymore
   */
  serviceLogId?: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  serviceCode: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  supplierCode: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  supplierName?: string;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  @IsOptional()
  /**
   * @deprecated - This field is not used anymore
   */
  amountToRetry?: number;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  @IsOptional()
  /**
   * @deprecated - This field is not used anymore
   */
  lastRetryAt?: string;
}

export class QueryReprocess {
  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  @IsOptional()
  requeryTries?: number;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  @IsOptional()
  lastRetryAt?: Date;
}

export class QueryEntity {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  createdAt: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentQuery: string;

  @EnumUtil.ApiProperty(QueryDocumentType)
  @IsEnum(QueryDocumentType)
  documentType: QueryDocumentType;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  executionTime: number;

  @ApiProperty()
  @IsObject()
  @Type(() => QueryKeys)
  queryKeys: QueryKeys;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refClass: string;

  @ApiProperty()
  @IsObject()
  responseJson: Record<string, unknown>;

  @ApiProperty({ type: [QueryStackResultService] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueryStackResultService)
  stackResult: ReadonlyArray<QueryStackResultService>;

  @ApiProperty({ type: [QueryFailedService] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueryFailedService)
  failedServices: ReadonlyArray<QueryFailedService>;

  @EnumUtil.ApiProperty(QueryStatus)
  @IsEnum(QueryStatus)
  /**
   * @deprecated - Should use the queryStatus param to represent the status of the query
   */
  status: QueryStatus;

  @EnumUtil.ApiProperty(QueryStatus)
  @IsEnum(QueryStatus)
  queryStatus: QueryStatus;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  queryCode: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  logId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reprocessedFromQueryId: string;

  @ApiProperty({ type: QueryReprocess })
  @Type(() => QueryReprocess)
  reprocess: QueryReprocess;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  version: number;

  @ApiProperty()
  @IsArray()
  rules: QueryRules[];
}
