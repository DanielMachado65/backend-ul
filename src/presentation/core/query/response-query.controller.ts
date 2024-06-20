import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseQueryQueueInputDto } from 'src/domain/_layer/presentation/dto/response-query-queue.input.dto';

import {
  ResponseQueryInputDto,
  ResponseReprocessQueryInputDto,
} from 'src/domain/_layer/presentation/dto/response-query.input.dto';
import { ResponseCreditQueryDomain } from 'src/domain/core/query/credit/response-credit-query.domain';
import { ReprocessQueryQueueDomain } from 'src/domain/core/query/reprocess-query-queue.domain';
import { RequestTestDriveDomain } from 'src/domain/core/query/v2/request-test-drive.domain';
import { ResponseQueryDomain, ResponseQueryResult } from 'src/domain/core/query/v2/response-query.domain';
import { ResponseReprocessQueryV2Domain } from 'src/domain/core/query/v2/response-reprocess-query-v2.domain';
import { ResponseTestDriveDomain, ResponseTestDriveResult } from 'src/domain/core/query/v2/response-test-drive.domain';
import { SaveReceivedReviewDatasheetQueryDomain } from 'src/domain/support/owner-review/save-received-review-datasheet-query.domain';

@ApiBearerAuth()
@ApiTags('Resposta da Consulta')
@Controller('response-query')
export class ResponseQueryController {
  constructor(
    private readonly _responseTestDriveDomain: ResponseTestDriveDomain,
    private readonly _responseQueryDomain: ResponseQueryDomain,
    private readonly _saveReceivedReviewDatasheetQueryDomain: SaveReceivedReviewDatasheetQueryDomain,
    private readonly _reprocessQueryQueueDomain: ReprocessQueryQueueDomain,
    private readonly _responseReprocessQueryV2Domain: ResponseReprocessQueryV2Domain,
    private readonly _responseCreditQueryDomain: ResponseCreditQueryDomain,
  ) {}

  @MessagePattern('query_response')
  responseQuery(
    @Payload() { queryResponse, templateQueryRef }: ResponseQueryInputDto,
  ): Promise<ResponseTestDriveResult | ResponseQueryResult | unknown> {
    switch (templateQueryRef.toString()) {
      case RequestTestDriveDomain.QUERY_CODE.toString():
        return this._responseTestDriveDomain.responseTestDrive(queryResponse).safeRun();

      case SaveReceivedReviewDatasheetQueryDomain.QUERY_CODE.toString():
        return this._saveReceivedReviewDatasheetQueryDomain.saveResponse(queryResponse).safeRun();

      case ResponseCreditQueryDomain.QUERY_CODE.toString():
        return this._responseCreditQueryDomain.responseQuery(queryResponse).safeRun();

      default:
        return this._responseQueryDomain.responseQuery(queryResponse).safeRun();
    }
  }

  @MessagePattern('query_reprocess_response')
  responseQuery2(
    @Payload() { queryResponse, status }: ResponseReprocessQueryInputDto,
  ): Promise<ResponseTestDriveResult | ResponseQueryResult | unknown> {
    return this._responseReprocessQueryV2Domain.response(queryResponse, { status }).safeRun();
  }

  @MessagePattern('query_response_legacy')
  async responseQueryLagacy(@Payload() { queryRef, queryResponse, status }: ResponseQueryQueueInputDto): Promise<void> {
    this._reprocessQueryQueueDomain.saveLegacyQuery(queryRef, { ...queryResponse, status }).safeRun();
  }
}
