import { IsBoolean, IsEnum, IsInt, IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnumUtil } from '../../infrastructure/util/enum.util';

export enum NfeStatus {
  NOT_SENT = 'Não Enviada',
  HOPE_FOR_AUTHORIZATION = 'Aguardando Autorização',
  HOPE_FOR_AUTHORIZATION_EXTERNAL = 'AguardandoAutorizacao',
  ASKING_FOR_AUTHORIZATION = 'SolicitandoAutorizacao',
  ASKED_AUTHORIZATION = 'AutorizacaoSolicitada',
  IN_AUTHORIZATION_PROCESS = 'EmProcessoDeAutorizacao',
  AUTHORIZED_WAITING_PDF_GENERATION = 'AutorizadaAguardandoGeracaoPDF',
  AUTHORIZED = 'Autorizada',
  DENIED = 'Negada',
  HOPE_FOR_BE_CANCELED = 'Aguardando Cancelamento',
  ASKING_FOR_CANCELLATION = 'SolicitandoCancelamento',
  ASKED_CANCELLATION = 'CancelamentoSolicitado',
  IN_CANCELLATION_PROCESS = 'EmProcessoDeCancelamento',
  CANCELLED_WAITING_PDF_UPDATE = 'CanceladaAguardandoAtualizacaoPDF',
  CANCEL_WAS_DENIED = 'CancelamentoNegado',
  ERROR_SENT = 'Erro de Envio',
  CANCELLED = 'Cancelada',
}

export const allNfeStatus: ReadonlyArray<NfeStatus> = [
  NfeStatus.NOT_SENT,
  NfeStatus.HOPE_FOR_AUTHORIZATION,
  NfeStatus.HOPE_FOR_AUTHORIZATION_EXTERNAL,
  NfeStatus.ASKING_FOR_AUTHORIZATION,
  NfeStatus.ASKED_AUTHORIZATION,
  NfeStatus.IN_AUTHORIZATION_PROCESS,
  NfeStatus.AUTHORIZED_WAITING_PDF_GENERATION,
  NfeStatus.AUTHORIZED,
  NfeStatus.DENIED,
  NfeStatus.HOPE_FOR_BE_CANCELED,
  NfeStatus.ASKING_FOR_CANCELLATION,
  NfeStatus.ASKED_CANCELLATION,
  NfeStatus.IN_CANCELLATION_PROCESS,
  NfeStatus.CANCELLED_WAITING_PDF_UPDATE,
  NfeStatus.CANCEL_WAS_DENIED,
  NfeStatus.ERROR_SENT,
  NfeStatus.CANCELLED,
];

export class NfeEntity {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @EnumUtil.ApiProperty(NfeStatus)
  @IsEnum(NfeStatus)
  status: NfeStatus;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiProperty()
  xmlLink: string | null;

  @IsString()
  @ApiProperty()
  pdfLink: string | null;

  @IsInt()
  @ApiProperty()
  valueInCents: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  paymentId: string;

  @IsString()
  @ApiProperty()
  externalNfeId: string | null;

  @IsBoolean()
  @ApiProperty()
  isManuallyGenerated: boolean;

  @ApiProperty()
  @IsString()
  cnpj: string;

  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty()
  @IsString()
  confirmationNumber: string;

  @IsISO8601()
  @ApiProperty()
  createdAt: string;

  @IsISO8601()
  @ApiProperty()
  updatedAt: string;
}
