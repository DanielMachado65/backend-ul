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
import { OwnerOpinonEntity } from 'src/domain/_entity/owner-opinion.entity';
import { EnumUtil } from 'src/infrastructure/util/enum.util';
import { TestDriveVehicleReviewEntity } from './vehicle-review.entity';
import { TestDriveVehicleBlogReviewEntity } from './vehicle-blog-review.entity';
import { TestDriveVehicleYoutubeReviewEntity } from './vehicle-youtube-review.entity';

export enum TestDriveQueryDocumentType {
  PLATE = 'PLACA',
}

export const allTestDriveQueryDocumentTypes: ReadonlyArray<TestDriveQueryDocumentType> = [
  TestDriveQueryDocumentType.PLATE,
];

export enum TestDriveQueryStatus {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILURE = 'failure',
  REPROCESSING = 'reprocessing',
}

export class TestDriveQueryKeys {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Matches(/^[A-Za-z]{3}\d[A-Ja-j0-9]\d{2}$/)
  plate?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  chassis?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  state?: string;
}

export class TestDriveQueryStackResultService {
  @ApiProperty()
  @IsOptional()
  rawData: unknown;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceLogId: string;

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
}

export class TestDriveQueryFailedService {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceLogId: string;

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
}

export class TestDriveQueryUserActions {
  @ApiProperty()
  @IsString()
  @IsOptional()
  chosenFipeId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  chosenVersion?: string;
}

export class TestDriveQueryControl {
  @ApiProperty()
  @IsString()
  @IsOptional()
  requestIp?: string;
}

export class TestDriveBasicData {
  @ApiProperty()
  @IsNumber()
  anoFabricacao: number;

  @ApiProperty()
  @IsNumber()
  anoModelo: number;

  @ApiProperty()
  @IsString()
  chassi: string;

  @ApiProperty()
  @IsString()
  especie: string;

  @ApiProperty()
  @IsString()
  marca: string;

  @ApiProperty()
  @IsString()
  marcaModelo: string;

  @ApiProperty()
  @IsString()
  modelo: string;

  @ApiProperty()
  @IsNumber()
  numeroDeFotos: number;

  @ApiProperty()
  @IsString()
  placa: string;

  @ApiProperty()
  @IsBoolean()
  possuiHistoricoKM: boolean;

  @ApiProperty()
  @IsNumber()
  potencia: string;

  @ApiProperty()
  @IsString()
  renavam: string;

  @ApiProperty()
  @IsString()
  tipoVeiculo: string;
}

export class TestDriveDataSheetSpec {
  @ApiProperty()
  @IsString()
  propriedade: string;

  @ApiProperty()
  @IsString()
  valor: string;
}

export class TestDriveFipePriceHistory {
  @ApiProperty()
  @IsString()
  x: string;

  @ApiProperty()
  @IsString()
  y: number;
}

export class TestDriveDataSheet {
  @ApiProperty()
  @IsString()
  fipeId: string;

  @ApiProperty()
  @IsNumber()
  valorAtual: number;

  @ApiProperty()
  @IsString()
  variacao: string;

  @ApiProperty()
  @IsString()
  ref: string;

  @ApiProperty({ type: [TestDriveFipePriceHistory] })
  @IsObject()
  @Type(() => TestDriveFipePriceHistory)
  precoUltimos6Meses: ReadonlyArray<TestDriveFipePriceHistory>;

  @ApiProperty({ type: [TestDriveDataSheetSpec] })
  @IsObject()
  @Type(() => TestDriveDataSheetSpec)
  desempenho: ReadonlyArray<TestDriveDataSheetSpec>;

  @ApiProperty({ type: [TestDriveDataSheetSpec] })
  @IsObject()
  @Type(() => TestDriveDataSheetSpec)
  consumo: ReadonlyArray<TestDriveDataSheetSpec>;

  @ApiProperty({ type: [TestDriveDataSheetSpec] })
  @IsObject()
  @Type(() => TestDriveDataSheetSpec)
  geral: ReadonlyArray<TestDriveDataSheetSpec>;

  @ApiProperty({ type: [TestDriveDataSheetSpec] })
  @IsObject()
  @Type(() => TestDriveDataSheetSpec)
  transmissao: ReadonlyArray<TestDriveDataSheetSpec>;

  @ApiProperty({ type: [TestDriveDataSheetSpec] })
  @IsObject()
  @Type(() => TestDriveDataSheetSpec)
  freios: ReadonlyArray<TestDriveDataSheetSpec>;

  @ApiProperty({ type: [TestDriveDataSheetSpec] })
  @IsObject()
  @Type(() => TestDriveDataSheetSpec)
  direcao: ReadonlyArray<TestDriveDataSheetSpec>;
}

export class TestDriveFipeVersion {
  @ApiProperty()
  @IsString()
  fipeId: string;

  @ApiProperty()
  @IsString()
  versao: string;
}

export class TestDriveInsuranceQuoteCoverage {
  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  order: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  isIncluded: boolean;
}

export class TestDriveInsuranceQuote {
  @ApiProperty()
  @IsString()
  externalUrl: string;

  @ApiProperty()
  @IsString()
  vehicleVersion: string;

  @ApiProperty({ type: [TestDriveInsuranceQuoteCoverage] })
  @IsArray()
  @Type(() => TestDriveInsuranceQuoteCoverage)
  coverages: ReadonlyArray<TestDriveInsuranceQuoteCoverage>;
}

export class TestDriveResponseJson {
  @ApiProperty()
  @IsString()
  placa: string;

  @ApiProperty()
  @IsString()
  chassi: string;

  @ApiProperty()
  @IsString()
  renavam: string;

  @ApiProperty()
  @IsString()
  numMotor: string;

  @ApiProperty()
  @IsNumber()
  codigoMarcaModelo: number;

  @ApiProperty()
  @IsString()
  brandImageUrl: string;

  @ApiProperty({ type: TestDriveBasicData })
  @IsObject()
  @Type(() => TestDriveBasicData)
  dadosBasicos: TestDriveBasicData;

  @ApiProperty({ type: [TestDriveDataSheet] })
  @IsObject()
  @Type(() => TestDriveDataSheet)
  fichaTecnica: ReadonlyArray<TestDriveDataSheet>;

  @ApiProperty({ type: TestDriveFipeVersion })
  @IsObject()
  @Type(() => TestDriveFipeVersion)
  versoes: ReadonlyArray<TestDriveFipeVersion>;

  @ApiProperty({ type: OwnerOpinonEntity })
  @IsObject()
  @Type(() => OwnerOpinonEntity)
  opiniaoDoDono: OwnerOpinonEntity;

  @ApiProperty({ type: [TestDriveInsuranceQuote] })
  @IsObject()
  @Type(() => TestDriveInsuranceQuote)
  cotacaoSeguro: ReadonlyArray<TestDriveInsuranceQuote>;

  @ApiProperty({ type: TestDriveVehicleReviewEntity })
  @IsObject()
  @Type(() => TestDriveVehicleReviewEntity)
  avaliacaoVeicular: TestDriveVehicleReviewEntity;
}

export class TestDriveResponse {
  @ApiProperty()
  @IsString()
  placa: string;

  @ApiProperty()
  @IsString()
  chassi: string;

  @ApiProperty()
  @IsString()
  renavam: string;

  @ApiProperty()
  @IsString()
  numMotor: string;

  @ApiProperty()
  @IsNumber()
  codigoMarcaModelo: number;

  @ApiProperty()
  @IsString()
  brandImageUrl: string;

  @ApiProperty({ type: TestDriveBasicData })
  @IsObject()
  @Type(() => TestDriveBasicData)
  dadosBasicos: TestDriveBasicData;

  @ApiProperty({ type: [TestDriveDataSheet] })
  @IsObject()
  @Type(() => TestDriveDataSheet)
  fichaTecnica: ReadonlyArray<TestDriveDataSheet>;

  @ApiProperty({ type: TestDriveFipeVersion })
  @IsObject()
  @Type(() => TestDriveFipeVersion)
  versoes: ReadonlyArray<TestDriveFipeVersion>;

  @ApiProperty({ type: OwnerOpinonEntity })
  @IsObject()
  @Type(() => OwnerOpinonEntity)
  opiniaoDoDono: OwnerOpinonEntity;

  @ApiProperty({ type: [TestDriveInsuranceQuote] })
  @IsObject()
  @Type(() => TestDriveInsuranceQuote)
  cotacaoSeguro: ReadonlyArray<TestDriveInsuranceQuote>;

  @ApiProperty({ type: TestDriveVehicleBlogReviewEntity })
  @IsObject()
  @Type(() => TestDriveVehicleBlogReviewEntity)
  avaliacaoBlog: TestDriveVehicleBlogReviewEntity;

  @ApiProperty({ type: TestDriveVehicleYoutubeReviewEntity })
  @IsObject()
  @Type(() => TestDriveVehicleYoutubeReviewEntity)
  avaliacaoYoutube: TestDriveVehicleYoutubeReviewEntity;
}

export class TestDriveQueryEntity {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  userId?: string | null;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentQuery: string;

  @EnumUtil.ApiProperty(TestDriveQueryDocumentType)
  @IsEnum(TestDriveQueryDocumentType)
  documentType: TestDriveQueryDocumentType;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  executionTime: number;

  @ApiProperty({ type: TestDriveQueryKeys })
  @IsObject()
  @Type(() => TestDriveQueryKeys)
  queryKeys: TestDriveQueryKeys;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refClass: string;

  @ApiProperty({ type: TestDriveResponseJson })
  @IsObject()
  @Type(() => TestDriveResponseJson)
  responseJson: TestDriveResponseJson;

  @ApiProperty({ type: [TestDriveQueryStackResultService] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestDriveQueryStackResultService)
  stackResult: ReadonlyArray<TestDriveQueryStackResultService>;

  @ApiProperty({ type: [TestDriveQueryFailedService] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestDriveQueryFailedService)
  failedServices: ReadonlyArray<TestDriveQueryFailedService>;

  @IsArray()
  servicesToReprocess: ReadonlyArray<string>;

  @EnumUtil.ApiProperty(TestDriveQueryStatus)
  @IsEnum(TestDriveQueryStatus)
  queryStatus: TestDriveQueryStatus;

  @ApiProperty()
  @IsBoolean()
  /**
   * @deprecated - Should use the queryStatus param to represent the status of the query
   */
  status: boolean;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  queryCode: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  logError?: string;

  @ApiProperty({ type: TestDriveQueryUserActions })
  @ValidateNested()
  @Type(() => TestDriveQueryUserActions)
  userActions: TestDriveQueryUserActions;

  @ApiProperty({ type: TestDriveQueryControl })
  @ValidateNested()
  @Type(() => TestDriveQueryControl)
  control: TestDriveQueryControl;
}

export type TestDriveQueryResponseEntity = Omit<TestDriveQueryEntity, 'responseJson'> & {
  readonly responseJson: TestDriveResponse;
};
