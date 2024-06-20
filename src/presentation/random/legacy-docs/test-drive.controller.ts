import { Controller, Get, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiGoneResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';
import { Roles } from '../../../infrastructure/guard/roles.guard';

class TestDriveKeys {
  @ApiProperty()
  placa: string;
}

class TestDriveBody {
  @ApiProperty()
  queryCode: number;

  @ApiProperty()
  userCity: string;

  @ApiProperty({ type: () => TestDriveKeys })
  keys: TestDriveKeys;
}

class BasicData {
  @ApiPropertyOptional()
  anoFabricacao?: string;

  @ApiPropertyOptional()
  anoModelo?: string;

  @ApiPropertyOptional()
  chassi?: string;

  @ApiPropertyOptional()
  marca?: string;

  @ApiPropertyOptional()
  modelo?: string;

  @ApiPropertyOptional()
  numeroDeFotos?: number;

  @ApiPropertyOptional()
  placa?: string;

  @ApiPropertyOptional()
  possuiHistoricoKM?: boolean;

  @ApiPropertyOptional()
  renavam?: string;
}

class Coordinate {
  @ApiProperty()
  x: string;

  @ApiProperty()
  y: string;
}

class KeyValue {
  @ApiProperty()
  propriedade: string;

  @ApiProperty()
  valor: string;
}

class DataSheet {
  @ApiPropertyOptional()
  fipeId?: string;

  @ApiPropertyOptional()
  valorAtual?: string;

  @ApiPropertyOptional()
  variacao?: string;

  @ApiPropertyOptional()
  ref?: string;

  @ApiPropertyOptional({ type: Coordinate, isArray: true })
  precoUltimos6Meses?: ReadonlyArray<Coordinate>;

  @ApiPropertyOptional({ type: KeyValue, isArray: true })
  desempenho?: ReadonlyArray<KeyValue>;

  @ApiPropertyOptional({ type: KeyValue, isArray: true })
  consumo?: ReadonlyArray<KeyValue>;

  @ApiPropertyOptional({ type: KeyValue, isArray: true })
  geral?: ReadonlyArray<KeyValue>;

  @ApiPropertyOptional({ type: KeyValue, isArray: true })
  direcao?: ReadonlyArray<KeyValue>;

  @ApiPropertyOptional({ type: KeyValue, isArray: true })
  freios?: ReadonlyArray<KeyValue>;

  @ApiPropertyOptional({ type: KeyValue, isArray: true })
  transmissao?: ReadonlyArray<KeyValue>;
}

class Version {
  @ApiPropertyOptional()
  fipeId?: string;

  @ApiPropertyOptional()
  versao?: string;
}

class Score {
  @ApiProperty()
  cambio: number;

  @ApiProperty()
  conforto: number;

  @ApiProperty()
  consumoNaCidade: number;

  @ApiProperty()
  consumoNaEstrada: number;

  @ApiProperty()
  custoBeneficio: number;

  @ApiProperty()
  dirigibilidade: number;

  @ApiProperty()
  espacoInterno: number;

  @ApiProperty()
  estabilidade: number;

  @ApiProperty()
  freios: number;

  @ApiProperty()
  performance: number;

  @ApiProperty()
  portaMalas: number;

  @ApiProperty()
  suspensao: number;
}

class OwnerReview {
  @ApiProperty({ type: () => Score })
  score: Score;
}

class Coverage {
  @ApiProperty()
  type: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  isIncluded: boolean;
}

class VehicleVersion {
  @ApiProperty()
  vehicleVersion: string;

  @ApiProperty({ type: () => Coverage, isArray: true })
  coverages: ReadonlyArray<Coverage>;

  @ApiProperty()
  externalUrl: string;
}

class TestDriveData {
  @ApiProperty()
  readonly codigoMarcaModelo: string;

  @ApiProperty()
  readonly brandImageUrl: string;

  @ApiProperty({ type: () => BasicData })
  readonly dadosBasicos: BasicData;

  @ApiProperty({ type: () => DataSheet, isArray: true })
  readonly fichaTecnica: ReadonlyArray<DataSheet>;

  @ApiProperty({ type: () => Version, isArray: true })
  readonly versoes: ReadonlyArray<Version>;

  @ApiProperty({ type: () => OwnerReview })
  readonly opiniaoDoDono: OwnerReview;

  @ApiProperty({ type: () => VehicleVersion, isArray: true })
  readonly cotacaoSeguro: ReadonlyArray<VehicleVersion>;
}

class TestDriveHeaderInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: number;

  @ApiProperty()
  documentQuery: string;
}

class TestDriveResponse {
  @ApiProperty({ type: () => TestDriveHeaderInfo })
  headerInfos: TestDriveHeaderInfo;

  @ApiProperty({ type: () => TestDriveData })
  data: TestDriveData;
}

class TestDriveResponseNotFound {
  @ApiProperty({ type: () => TestDriveHeaderInfo })
  headerInfos: TestDriveHeaderInfo;

  @ApiProperty({ example: 'null' })
  data: unknown;
}

class TestDriveSuccess {
  @ApiProperty({ example: 200 })
  status: number;

  @ApiProperty({ type: () => TestDriveResponse })
  body: TestDriveResponse;
}

class TestDriveError {
  @ApiProperty({ example: 410 })
  status: number;

  @ApiProperty()
  body: string;
}

class TestDriveSuccessButNotFound {
  @ApiProperty({ example: 200 })
  status: number;

  @ApiProperty()
  body: TestDriveResponseNotFound;
}

@ApiTags('Consulta')
@Controller('/')
export class LegacyTestDriveController {
  @Post('query-executor/test-drive')
  @ApiBody({ type: () => TestDriveBody })
  @ApiOperation({ summary: 'Execute test drive (Legacy)' })
  @ApiExtraModels(TestDriveSuccess, TestDriveSuccessButNotFound)
  @ApiOkResponse({
    description: 'Test drive executed successfully, with found and not found responses **(see schema!)**',
    schema: {
      oneOf: refs(TestDriveSuccess, TestDriveSuccessButNotFound),
    },
  })
  @ApiGoneResponse({ description: 'Test drive error', type: TestDriveError })
  @Roles([UserRoles.GUEST])
  requestTestDrive(): Promise<null> {
    return Promise.resolve(null);
  }

  @Get('test-drive/representation/:queryId')
  @ApiOperation({ summary: 'Retrieve test drive query (Legacy)' })
  @ApiExtraModels(TestDriveSuccess, TestDriveSuccessButNotFound)
  @ApiOkResponse({
    description: 'Test drive executed successfully, with found and not found responses **(see schema!)**',
    schema: {
      oneOf: refs(TestDriveSuccess, TestDriveSuccessButNotFound),
    },
  })
  @ApiGoneResponse({ description: 'Test drive error', type: TestDriveError })
  @Roles([UserRoles.GUEST])
  getTestDriveQuery(): Promise<null> {
    return Promise.resolve(null);
  }
}
