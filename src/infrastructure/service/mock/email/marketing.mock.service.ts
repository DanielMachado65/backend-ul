import { Injectable } from '@nestjs/common';
import {
  InputFeedbackQueryDto,
  InputInitPaymentDto,
  InputPartnerInteractionDto,
  InputQueryDto,
  InputQueryRegisterOwnerReviewDto,
  MarkintingService,
  PaymentEmailMarketingDto,
  RegisterIndicateAndWin,
} from 'src/domain/_layer/infrastructure/service/marketing.service';

@Injectable()
export class EmailMarkintingMockService implements MarkintingService {
  async registerClickOnButtonDebts(_input: InputPartnerInteractionDto): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async registerIndicateAndWin(_input: RegisterIndicateAndWin): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async registerUserInitPaid(_input: InputInitPaymentDto): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async registerQuery(_input: InputQueryDto): Promise<void> {
    return null;
  }

  async registerOwnerReview(_input: Partial<InputQueryRegisterOwnerReviewDto>): Promise<void> {
    return Promise.resolve(undefined);
  }

  async registerIsHasDabits(_input: Partial<InputQueryDto>): Promise<void> {
    return null;
  }

  async registerUserPaid(_input: Partial<PaymentEmailMarketingDto>): Promise<void> {
    return Promise.resolve(undefined);
  }

  async registerUserPaidDebts(_input: Partial<PaymentEmailMarketingDto>): Promise<void> {
    return Promise.resolve(undefined);
  }

  async registerNewClient(_input: Partial<PaymentEmailMarketingDto>): Promise<void> {
    return Promise.resolve(undefined);
  }

  async registerFeedbackQuery(_input: InputFeedbackQueryDto): Promise<void> {
    return Promise.resolve(undefined);
  }
}
