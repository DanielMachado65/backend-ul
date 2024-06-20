import { AddUserParams } from 'src/domain/core/user/add-user.domain';

export type InputQueryDto = {
  readonly email: string;
  readonly fullName: string;
  readonly phoneNumber: string;
  readonly birthday: string;
  readonly plate: string;
  readonly model: string;
  readonly brand: string;
  readonly totalDebits?: string;
  readonly renavam?: string;
};

export type InputQueryRegisterOwnerReviewDto = InputQueryDto & {
  readonly firstName: string;
  readonly lastName: string;
};

export type PaymentEmailMarketingDto = {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly birthday: string;
  readonly purchase: string;
};

export type InputFeedbackQueryDto = {
  readonly email: string;
  readonly evaluation: number;
};

export type InputInitPaymentDto = {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly birthday: string;
  readonly pricePay: string;
  readonly purchase: string;
};

export type InputPartnerInteractionDto = {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly plate: string;
  readonly model: string;
  readonly brand: string;
  readonly brandModel: string;
  readonly phone: string;
  readonly birthday: string;
};

export type RegisterIndicateAndWin = {
  email: string;
  firstName: string;
  lastName: string;
  url: string;
};

export abstract class MarkintingService {
  abstract registerQuery(input: InputQueryDto): Promise<void>;
  abstract registerIsHasDabits(input: Partial<InputQueryDto>): Promise<void>;
  abstract registerUserPaid(input: Partial<PaymentEmailMarketingDto>): Promise<void>;
  abstract registerUserPaidDebts(input: Partial<PaymentEmailMarketingDto>): Promise<void>;
  abstract registerUserInitPaid(input: InputInitPaymentDto): Promise<void>;
  abstract registerOwnerReview(input: Partial<InputQueryRegisterOwnerReviewDto>): Promise<void>;
  abstract registerNewClient(input: AddUserParams): Promise<void>;
  abstract registerFeedbackQuery(input: InputFeedbackQueryDto): Promise<void>;
  abstract registerClickOnButtonDebts(input: InputPartnerInteractionDto): Promise<void>;
  abstract registerIndicateAndWin(input: RegisterIndicateAndWin): Promise<void>;
}
