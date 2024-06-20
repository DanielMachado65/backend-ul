import { Injectable } from '@nestjs/common';
import {
  PaymentEventDto,
  TagManagerDto,
  TagManagerService,
} from '../../../domain/_layer/infrastructure/service/tag-manager.service';

@Injectable()
export class GoogleTagManagerMockService implements TagManagerService {
  dispatchPaymentSucceed(_payload: TagManagerDto<PaymentEventDto>): Promise<boolean> {
    return Promise.resolve(true);
  }
}
