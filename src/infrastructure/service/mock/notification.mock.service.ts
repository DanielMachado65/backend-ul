import { Injectable } from '@nestjs/common';
import {
  DispatchFunc,
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
  PayloadType,
} from '../../../domain/_layer/infrastructure/service/notification';

@Injectable()
export class NotificationMockService extends NotificationServiceGen {
  override dispatch: DispatchFunc = async (
    transport: NotificationTransport,
    id: NotificationType,
    payload: PayloadType,
  ): Promise<boolean> => {
    switch (transport) {
      case NotificationTransport.EMAIL:
        return NotificationMockService._dispatchEmail(id, payload);
      default:
        return false;
    }
  };

  private static async _dispatchEmail(_id: NotificationType, payload: PayloadType): Promise<boolean> {
    const email: string = (payload as { readonly email: string }).email;
    return !email.startsWith('fail');
  }
}
