import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsObject, IsString, ValidateNested } from 'class-validator';
import { Observable, firstValueFrom } from 'rxjs';
import { ChannelType, CompleteUserConsent, ConsentType, UserConsents } from 'src/domain/_entity/user-consents.entity';
import { ConsentsService } from 'src/domain/_layer/infrastructure/service/user-consents.service';
import { ENV_KEYS, EnvService } from '../framework/env.service';
import { ClassValidatorUtil } from '../util/class-validator.util';
import { DateTimeUtil } from '../util/date-time-util.service';
import { EnumUtil } from '../util/enum.util';

class ExternalUserConsent {
  @IsString()
  id: string;

  @IsString()
  externalApplicationId: string;

  @IsString()
  externalUserId: string;

  @IsString()
  @IsEnum(EnumUtil.enumToArray(ConsentType))
  consentType: string;

  @IsString()
  @IsEnum(EnumUtil.enumToArray(ChannelType))
  channelType: string;

  @IsBoolean()
  hasGivenConsent: boolean;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;
}

class GetUserConsentsBodyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExternalUserConsent)
  data: ReadonlyArray<ExternalUserConsent>;
}

class UpdateUserConsentBodyDto {
  @IsObject()
  @Type(() => ExternalUserConsent)
  data: ExternalUserConsent;
}

@Injectable()
export class UserConsentsService implements ConsentsService {
  private readonly _applicationId: string;
  private readonly _baseUrl: string;

  constructor(
    private readonly _httpService: HttpService,
    private readonly _envService: EnvService,
    private readonly _validatorUtil: ClassValidatorUtil,
    private readonly _dateTimeUtil: DateTimeUtil,
  ) {
    this._applicationId = this._envService.get(ENV_KEYS.APPLICATION_ID);
    this._baseUrl = this._envService.get(ENV_KEYS.UCC_URL);
  }

  async createUserConsentBatch(
    userId: string,
    consentVariations: ReadonlyArray<UserConsents>,
  ): Promise<ReadonlyArray<UserConsents>> {
    const url: string = this._baseUrl + '/consent/batch';
    const applicationId: string = this._applicationId;
    const httpResponse$: Observable<AxiosResponse<ReadonlyArray<UserConsents>>> = this._httpService.post(url, {
      userId,
      applicationId,
      consentVariations,
    });
    const response: AxiosResponse<ReadonlyArray<UserConsents>> = await firstValueFrom(httpResponse$);
    return response.data;
  }

  async createConsent(userId: string, consents: UserConsents): Promise<void> {
    const url: string = this._baseUrl + '/consent';
    const applicationId: string = this._applicationId;
    const httpResponse$: Observable<AxiosResponse<void>> = this._httpService.post(url, {
      applicationId,
      userId,
      consentType: consents.consentType,
      channelType: consents.channelType,
      hasGivenConsent: consents.hasGivenConsent,
    });

    await firstValueFrom(httpResponse$);
  }

  async getUserConsents(userId: string): Promise<ReadonlyArray<CompleteUserConsent>> {
    const url: string = `${this._baseUrl}/consent/by-user/${this._applicationId}/${userId}`;
    const httpResponse$: Observable<AxiosResponse<ReadonlyArray<ExternalUserConsent>>> = this._httpService.get(url);
    const response: AxiosResponse<ReadonlyArray<ExternalUserConsent>> = await firstValueFrom(httpResponse$);
    if (response.status === 200) {
      const userConsents: GetUserConsentsBodyDto = await this._validatorUtil
        .validateAndResult(response.data, GetUserConsentsBodyDto)
        .unsafeRun();

      return userConsents.data.map(this._externalToDomainComplete.bind(this));
    } else {
      throw response;
    }
  }

  async isGivenConsent(userId: string, channel: ChannelType): Promise<boolean> {
    const userConsents: ReadonlyArray<CompleteUserConsent> = await this.getUserConsents(userId);
    const completeUserConsent: CompleteUserConsent = userConsents
      .filter((consent: CompleteUserConsent) => consent.channelType === channel)
      .find((consent: CompleteUserConsent) => consent.hasGivenConsent === true);

    return (completeUserConsent && completeUserConsent.hasGivenConsent) || false;
  }

  async updateUserConsent(consentId: string, userId: string, hasGivenConsent: boolean): Promise<CompleteUserConsent> {
    const url: string = `${this._baseUrl}/consent/${consentId}/by-user/${userId}`;
    const httpResponse$: Observable<AxiosResponse<ReadonlyArray<ExternalUserConsent>>> = this._httpService.put(url, {
      hasGivenConsent,
    });
    const response: AxiosResponse<ReadonlyArray<ExternalUserConsent>> = await firstValueFrom(httpResponse$);
    if (response.status === 200) {
      const validateResponse: UpdateUserConsentBodyDto = await this._validatorUtil
        .validateAndResult(response.data, UpdateUserConsentBodyDto)
        .unsafeRun();
      const consent: ExternalUserConsent = validateResponse.data;

      return this._externalToDomainComplete(consent);
    } else {
      throw response;
    }
  }

  private _externalToDomainComplete(consent: ExternalUserConsent): CompleteUserConsent {
    const hasPast3Months: boolean =
      this._dateTimeUtil.now().diff(this._dateTimeUtil.fromIso(consent.updatedAt), 'months') >= 3;

    return {
      id: consent.id,
      consentType: consent.consentType as ConsentType,
      channelType: consent.channelType as ChannelType,
      hasGivenConsent: consent.hasGivenConsent,
      createdAt: consent.createdAt,
      updatedAt: consent.updatedAt,
      display: !consent.hasGivenConsent && hasPast3Months,
    };
  }
}
