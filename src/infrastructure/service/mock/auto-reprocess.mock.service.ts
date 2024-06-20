import { Injectable } from '@nestjs/common';

import { GetAutoReprocessQueryDto } from 'src/domain/_layer/data/dto/get-auto-reprocess-query.dto';
import { AutoReprocessQueryService } from 'src/domain/_layer/infrastructure/service/auto-reprocess.service';

@Injectable()
export class AutoReprocessQueryServiceMock implements AutoReprocessQueryService {
  async getByQueryId(_queryId: string): Promise<GetAutoReprocessQueryDto> {
    return {
      status: 'EXPIRED_TIME',
      createdAt: new Date(),
    };
  }

  async requestToReprocess(): Promise<void> {
    /** */
  }

  async cancelReprocess(_queryId: string): Promise<void> {
    /** */
  }
}
