import { Markinting, MenberStatus, OncListMarkintingEnum, OncTagsEnum } from '@diegomoura637/mail-sender';
import { Injectable } from '@nestjs/common';

import { ChannelType, UserConsents } from 'src/domain/_entity/user-consents.entity';
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
import { AddUserParams } from 'src/domain/core/user/add-user.domain';
import { ENV_KEYS, EnvService } from '../../framework/env.service';
import { DateTimeUtil } from '../../util/date-time-util.service';

type NameType = 'first' | 'last';

@Injectable()
export class EmailMarkintingService implements MarkintingService {
  private readonly _marketing: Markinting;

  constructor(private readonly _envService: EnvService, private readonly _dateTime: DateTimeUtil) {
    this._marketing = new Markinting(
      this._envService.get(ENV_KEYS.MAILSENDER_MK_API_KEY),
      this._envService.get(ENV_KEYS.MAILSENDER_MK_SERVER),
    );
  }

  private static _getPositionName(nameType: NameType, name: string): string {
    const splitName: readonly string[] = name.split(' ');

    if (nameType === 'first') {
      return splitName[0];
    } else if (splitName.length > 1) {
      return splitName[name.length - 1];
    }
    return '';
  }

  private _getBirthDay(birthday: string): string {
    return birthday ? this._dateTime.now().getMonthAndDay(birthday) : '01/01';
  }

  async registerQuery(input: InputQueryDto): Promise<void> {
    try {
      await this._marketing.updateList
        .setEmail(input.email)
        .updateList(OncListMarkintingEnum.COMPLETE_VEHICLE)
        .setMargeFields({
          FNAME: EmailMarkintingService._getPositionName('first', input.fullName),
          LNAME: EmailMarkintingService._getPositionName('last', input.fullName),
          BIRTHDAY: this._getBirthDay(input.birthday),
          PHONE: input.phoneNumber,
          PLATE: input.plate,
          MODEL: input.model,
          BRAND: input.brand,
          M_MODEL: input.model,
        })
        .setSatatus(MenberStatus.SUBSCRIBED)
        .setTegs([OncTagsEnum.QUERY])
        .exec();
    } catch (_error) {
      // Noop
    }
  }

  async registerIsHasDabits(input: Partial<InputQueryDto>): Promise<void> {
    try {
      const urlDebits: string = `https://www.olhonocarro.com.br/perfil/debitos-e-multas/?plate=${input.plate}&renavam=${input.renavam}`;

      await this._marketing.updateList
        .setEmail(input.email)
        .updateList(OncListMarkintingEnum.COMPLETE_VEHICLE)
        .setMargeFields({
          FNAME: EmailMarkintingService._getPositionName('first', input.fullName),
          LNAME: EmailMarkintingService._getPositionName('last', input.fullName),
          BIRTHDAY: this._getBirthDay(input.birthday),
          PLATE: input.plate,
          MODEL: input.model,
          BRAND: input.brand,
          M_MODEL: input.model,
          VAL_DEBITS: input.totalDebits,
          URL_DEBITS: urlDebits,
        })
        .setSatatus(MenberStatus.SUBSCRIBED)
        .setTegs([OncTagsEnum.IF_HAS_DEBITS])
        .exec();
    } catch (_error) {
      // Noop
    }
  }

  async registerClickOnButtonDebts({
    email,
    firstName,
    lastName,
    plate,
    model,
    brand,
    brandModel,
    phone,
    birthday,
  }: InputPartnerInteractionDto): Promise<void> {
    try {
      await this._marketing.updateList
        .setEmail(email)
        .updateList(OncListMarkintingEnum.COMPLETE_VEHICLE)
        .setMargeFields({
          FNAME: firstName,
          LNAME: lastName,
          PHONE: phone,
          BIRTHDAY: this._getBirthDay(birthday),
          PLATE: plate,
          MODEL: model,
          BRAND: brand,
          M_MODEL: brandModel,
        })
        .setSatatus(MenberStatus.SUBSCRIBED)
        .setTegs([OncTagsEnum.CLICK_ON_PAY_DEBITS])
        .exec();
    } catch (_error) {
      // Noop
    }
  }

  async registerOwnerReview({
    email,
    firstName,
    lastName,
    plate,
    model,
    brand,
  }: Partial<InputQueryRegisterOwnerReviewDto>): Promise<void> {
    try {
      await this._marketing.addInList
        .addListMember(OncListMarkintingEnum.COMPLETE_VEHICLE)
        .setEmail(email)
        .setStatus(MenberStatus.SUBSCRIBED)
        .setTegs([OncTagsEnum.FINISH_OWNER_OPINION])
        .setMargeFields({
          FNAME: firstName,
          LNAME: lastName,
          PHONE: '',
          BIRTHDAY: '01/01',
          PLATE: plate,
          MODEL: model,
          BRAND: brand,
          M_MODEL: '',
        })
        .exec();
    } catch (error) {
      console.error('Failed to register owner review:', error);
    }
  }

  registerUserPaid(input: Partial<PaymentEmailMarketingDto>): Promise<void> {
    return this._registerUsersThatPaid(input, [OncTagsEnum.PURCHASE]);
  }

  registerUserPaidDebts(input: Partial<PaymentEmailMarketingDto>): Promise<void> {
    return this._registerUsersThatPaid(input, [OncTagsEnum.PAY_DEBITS]);
  }

  async registerUserInitPaid(input: InputInitPaymentDto): Promise<void> {
    try {
      await this._marketing.updateList
        .updateList(OncListMarkintingEnum.COMPLETE_VEHICLE)
        .setSatatus(MenberStatus.SUBSCRIBED)
        .setEmail(input.email)
        .setMargeFields({
          FNAME: input.firstName,
          LNAME: input.lastName,
          PHONE: input.phone,
          BIRTHDAY: input.birthday,
          PRICEPAY: input.pricePay,
          PURCHASE: input.purchase,
        })
        .setTegs([OncTagsEnum.INIT_PAID])
        .exec();
    } catch (error) {
      // Noop
    }
  }

  async registerNewClient(input: AddUserParams): Promise<void> {
    try {
      await this._marketing.addInList
        .addListMember(OncListMarkintingEnum.COMPLETE_VEHICLE)
        .setEmail(input.email)
        .setStatus(MenberStatus.SUBSCRIBED)
        .setTegs([OncTagsEnum.NEW_CLIENT])
        .setMargeFields({
          FNAME: EmailMarkintingService._getPositionName('first', input.name),
          LNAME: EmailMarkintingService._getPositionName('last', input.name),
          WHATSAPP: this._getWhatsappConsent(input.consents),
        })
        .exec();
    } catch (_error) {
      // Noop
    }
  }

  async registerIndicateAndWin(input: RegisterIndicateAndWin): Promise<void> {
    try {
      await this._marketing.updateList
        .updateList(OncListMarkintingEnum.COMPLETE_VEHICLE)
        .setEmail(input.email)
        .setSatatus(MenberStatus.SUBSCRIBED)
        .setTegs([OncTagsEnum.INDICATE_AMD_WIN])
        .setMargeFields({
          FNAME: input.firstName,
          LNAME: input.lastName,
          URL: input.url,
        })
        .exec();
    } catch (_error) {
      // Noop
    }
  }

  async registerFeedbackQuery(input: InputFeedbackQueryDto): Promise<void> {
    try {
      await this._marketing.updateList
        .setEmail(input.email)
        .updateList(OncListMarkintingEnum.COMPLETE_VEHICLE)
        .setSatatus(MenberStatus.SUBSCRIBED)
        .setTegs(['FEEDBACK'])
        .setMargeFields({
          FEEDBACK: input.evaluation,
        })
        .exec();
    } catch (_error) {
      // Noop
    }
  }

  private async _registerUsersThatPaid(
    input: Partial<PaymentEmailMarketingDto>,
    tags: ReadonlyArray<string>,
  ): Promise<void> {
    try {
      await this._marketing.addInList
        .addListMember(OncListMarkintingEnum.COMPLETE_VEHICLE)
        .setEmail(input.email)
        .setStatus(MenberStatus.SUBSCRIBED)
        // eslint-disable-next-line functional/prefer-readonly-type
        .setTegs(tags as Array<string>)
        .setMargeFields({
          FNAME: input.firstName,
          LNAME: input.lastName,
          PHONE: input.phone,
          BIRTHDAY: input.birthday,
          PURCHASE: input.purchase,
        })
        .exec();
    } catch (_error) {
      // Noop
    }
  }

  private _getWhatsappConsent(consents: readonly UserConsents[]): string {
    const consent: UserConsents = consents.find(
      (consents: UserConsents) => consents.channelType === ChannelType.WHATSAPP,
    );
    return consent.hasGivenConsent ? 'Sim' : 'Não';
  }
}
