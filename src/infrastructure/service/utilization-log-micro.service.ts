import { HttpService } from '@nestjs/axios';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsISO8601, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { firstValueFrom, Observable } from 'rxjs';
import { UserUtilizationLogService } from 'src/domain/_layer/infrastructure/service/user-utilization-log.service';
import { EnvService, ENV_KEYS } from '../framework/env.service';
import { ClassValidatorUtil } from '../util/class-validator.util';
import { AxiosResponse } from 'axios';
import { UserLogDto } from 'src/domain/_layer/presentation/dto/user-log-output.dto';
import { Injectable } from '@nestjs/common';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { UtilizationLogsTracker } from '@diegomoura637/utilization-log-producer';

class UserLogDownloadDocDto {
  @IsString()
  readonly _id: string;

  @IsString()
  readonly token: string;

  @IsString()
  readonly actionDescription: string;

  @IsString()
  readonly actionName: string;

  @IsISO8601()
  readonly createdAt: string;
}

class WrappedUserLogDownloadDocDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserLogDownloadDocDto)
  data: ReadonlyArray<UserLogDownloadDocDto>;
}

class UserLogPaginationBodyDocDto {
  @IsString()
  readonly id: string;

  @IsString()
  readonly token: string;

  @IsString()
  readonly actionDescription: string;

  @IsString()
  readonly actionName: string;

  @IsISO8601()
  readonly createdAt: string;
}

class UserLogPaginationBodyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserLogPaginationBodyDocDto)
  readonly docs: ReadonlyArray<UserLogPaginationBodyDocDto>;

  @IsNumber()
  readonly totalDocs: number;

  @IsNumber()
  readonly limit: number;

  @IsNumber()
  readonly totalPages: number;

  @IsNumber()
  readonly page: number;

  @IsNumber()
  readonly pagingCounter: number;

  @IsBoolean()
  readonly hasPrevPage: boolean;

  @IsBoolean()
  readonly hasNextPage: boolean;

  @IsNumber()
  @IsOptional()
  readonly prevPage: number | null;

  @IsNumber()
  @IsOptional()
  readonly nextPage: number | null;
}

@Injectable()
export class UtilizationLogMicroService implements UserUtilizationLogService {
  private readonly _appId: string;
  private readonly _baseUrl: string;

  constructor(
    private readonly _httpService: HttpService,
    private readonly _envService: EnvService,
    private readonly _validatorUtil: ClassValidatorUtil,
    private readonly _utilizationLogsTracker: UtilizationLogsTracker,
  ) {
    this._baseUrl = _envService.get(ENV_KEYS.LOG_SERVICE_BASE_URL);
    this._appId = _envService.get(ENV_KEYS.APPLICATION_ID);
  }

  async getUserLogsPaginated(userId: string, page: number, limit: number): Promise<PaginationOf<UserLogDto>> {
    const httpResponse: Observable<AxiosResponse<UserLogPaginationBodyDto>> = await this._httpService.get(
      `${this._baseUrl}/${this._appId}/${userId}?limit=${limit}&page=${page}`,
    );
    const response: AxiosResponse<UserLogPaginationBodyDto> = await firstValueFrom(httpResponse);
    const responseValidated: UserLogPaginationBodyDto = await this._validatorUtil
      .validateAndResult(response.data, UserLogPaginationBodyDto)
      .unsafeRun();

    return {
      totalPages: responseValidated.totalPages,
      amountInThisPage: responseValidated.docs.length,
      currentPage: responseValidated.page,
      itemsPerPage: responseValidated.limit,
      nextPage: responseValidated.nextPage,
      previousPage: responseValidated.prevPage,
      items: responseValidated.docs.map((data: UserLogPaginationBodyDocDto) => ({
        id: data.id,
        token: data.token,
        actionDescription: data.actionDescription,
        actionName: data.actionName,
        createdAt: data.createdAt,
      })),
      count: responseValidated.totalDocs,
    };
  }

  async getAllUserLogs(userId: string): Promise<ReadonlyArray<UserLogDto>> {
    const httpResponse: Observable<AxiosResponse<string>> = await this._httpService.get(
      `${this._baseUrl}/download/${this._appId}/${userId}`,
    );
    const response: AxiosResponse<string> = await firstValueFrom(httpResponse);
    const wrapped: WrappedUserLogDownloadDocDto = { data: JSON.parse(Buffer.from(response.data).toString()) };
    const responseValidated: WrappedUserLogDownloadDocDto = await this._validatorUtil
      .validateAndResult(wrapped, WrappedUserLogDownloadDocDto)
      .unsafeRun();

    return responseValidated.data.map((data: UserLogDownloadDocDto) => ({
      id: data._id,
      token: data.token,
      actionDescription: data.actionDescription,
      actionName: data.actionName,
      createdAt: data.createdAt,
    }));
  }

  sendLog(userId: string, actionName: string, actionDescription: unknown, actionId: string): void {
    return this._utilizationLogsTracker.sendLog(userId, actionName, actionDescription, actionId);
  }
}
