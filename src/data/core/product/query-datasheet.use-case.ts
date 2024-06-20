import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { MyCarProductStatusEnum } from 'src/domain/_entity/my-car-product.entity';
import {
  CarNotFoundError,
  ProviderNoDataForSelectedVersion,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import {
  QueryRequestService,
  RequestQueryServiceInput,
} from 'src/domain/_layer/infrastructure/service/query-request.service';
import {
  MyCarQueryDatasheet,
  MyCarQueryDatasheetInformation,
} from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { QueryDatasheetDomain, QueryDatasheetIO } from 'src/domain/core/product/query-datasheet.domain';
import { BasicVehicleFipeVo, BasicVehicleVo } from 'src/domain/value-object/basic-vechicle.vo';
import { DatasheetRecord, DatasheetRecordSpec, DatasheetVo } from 'src/domain/value-object/datasheet.vo';

@Injectable()
export class QueryDatasheetUseCase implements QueryDatasheetDomain {
  private static readonly TEMPLATE_QUERY: string = '999';

  constructor(
    private readonly _myCarProductRepository: MyCarProductRepository,
    private readonly _queryRequestService: QueryRequestService,
  ) {}

  private _getCar(userId: string, carId: string) {
    return async (): Promise<MyCarProductWithUserDto> => {
      return await this._myCarProductRepository.getByUserIdAndCarId(userId, carId);
    };
  }

  private _requestDatasheet() {
    return async ({ keys, email, name }: MyCarProductWithUserDto): Promise<string> => {
      const randomicNumber: number = Math.random() + Date.now();
      const queryRef: string = btoa(randomicNumber.toString());
      const inputQuery: RequestQueryServiceInput = {
        queryRef: queryRef,
        templateQueryRef: QueryDatasheetUseCase.TEMPLATE_QUERY,
        keys: {
          plate: keys.plate,
          chassis: keys.chassis,
          fipeId: keys.fipeId,
          fipeIds: [keys.fipeId],
          modelYear: keys.modelYear,
          year: keys.modelYear,
          engine: keys.engineNumber,
          modelBrandCode: Number(keys.brandModelCode),
        },
        support: {
          userName: name,
          userEmail: email,
        },
      };

      await this._queryRequestService.requestQuery(inputQuery);
      return queryRef;
    };
  }

  private _getResponse() {
    return async (queryRef: string): Promise<QueryResponseDto> => {
      return await this._queryRequestService.getAsyncQueryByReference(queryRef);
    };
  }

  private _filterDatasheet(datasheet: ReadonlyArray<DatasheetVo>, fipeId: string): ReadonlyArray<DatasheetVo> {
    return datasheet.filter((result: DatasheetVo) => result.fipeId.toString() === fipeId);
  }

  private _parseDatasheetField(
    datasheet: ReadonlyArray<DatasheetVo>,
    fipeId: string,
    description: string,
  ): ReadonlyArray<MyCarQueryDatasheetInformation> {
    return this._filterDatasheet(datasheet, fipeId)
      .flatMap((result: DatasheetVo) => result.records)
      .filter((result: DatasheetRecord) => result.description === description)
      .flatMap((result: DatasheetRecord) => result.specs);
  }

  private _getDatasheetValue(
    datasheet: ReadonlyArray<DatasheetVo>,
    fipeId: string,
    description: string,
    property: string,
  ): string {
    return (
      this._filterDatasheet(datasheet, fipeId)
        .flatMap((result: DatasheetVo) => result.records)
        .filter((result: DatasheetRecord) => result.description === description)
        .flatMap((result: DatasheetRecord) => result.specs)
        .filter((result: DatasheetRecordSpec) => result.property === property)
        .flatMap((result: DatasheetRecordSpec) => result.value)[0] || null
    );
  }

  private _filterBasicVehicle(basicVehicle: BasicVehicleVo, fipeId: string): ReadonlyArray<BasicVehicleFipeVo> {
    return basicVehicle.fipeData.filter((result: BasicVehicleFipeVo) => result.fipeId.toString() === fipeId);
  }

  private _parseBasicVehicle(basicVehicle: BasicVehicleVo, fipeId: string): BasicVehicleFipeVo {
    return this._filterBasicVehicle(basicVehicle, fipeId)[0];
  }

  private _canBeParsed() {
    return ({ response, keys }: QueryResponseDto): boolean => {
      const datasheet: ReadonlyArray<DatasheetVo> = response.datasheet;
      const basicVehicle: BasicVehicleVo = response.basicVehicle;
      const fipeId: string = keys.fipeId;

      const itemsDatasheet: ReadonlyArray<DatasheetVo> = this._filterDatasheet(datasheet, fipeId);
      const itemsBasicVehicle: ReadonlyArray<BasicVehicleFipeVo> = this._filterBasicVehicle(basicVehicle, fipeId);

      return (
        Array.isArray(itemsDatasheet) &&
        itemsDatasheet.length > 0 &&
        Array.isArray(itemsBasicVehicle) &&
        itemsBasicVehicle.length > 0
      );
    };
  }

  private _parseResponse() {
    return ({ response, keys }: QueryResponseDto): MyCarQueryDatasheet => {
      const datasheet: ReadonlyArray<DatasheetVo> = response.datasheet;
      const basicVehicle: BasicVehicleVo = response.basicVehicle;
      const fipeId: string = keys.fipeId;

      return {
        fipeCode: keys.fipeId,
        version: this._parseBasicVehicle(basicVehicle, fipeId).version,
        currentValue: this._parseBasicVehicle(basicVehicle, fipeId).currentPrice.toString(),
        guarantee: this._getDatasheetValue(datasheet, fipeId, 'Geral', 'Garantia'),
        maxVelocity: this._getDatasheetValue(datasheet, fipeId, 'Desempenho', 'Velocidade máxima'),
        urbanConsumption: this._getDatasheetValue(datasheet, fipeId, 'Consumo', 'Urbano'),
        roadConsumption: this._getDatasheetValue(datasheet, fipeId, 'Consumo', 'Rodoviário'),
        transmission: this._parseDatasheetField(datasheet, fipeId, 'Transmissão'),
        consumption: this._parseDatasheetField(datasheet, fipeId, 'Bateria'),
        performance: this._parseDatasheetField(datasheet, fipeId, 'Consumo'),
        brake: this._parseDatasheetField(datasheet, fipeId, 'Freios'),
        suspension: this._parseDatasheetField(datasheet, fipeId, 'Suspensão'),
        steeringWheel: this._parseDatasheetField(datasheet, fipeId, 'Direção'),
        aerodynamics: this._parseDatasheetField(datasheet, fipeId, 'Aerodinâmica'),
        battery: this._parseDatasheetField(datasheet, fipeId, 'Bateria'),
        dimensions: this._parseDatasheetField(datasheet, fipeId, 'Dimensões'),
        lighting: this._parseDatasheetField(datasheet, fipeId, 'Iluminação'),
        lubricant: this._parseDatasheetField(datasheet, fipeId, 'Lubrificante'),
        motor: this._parseDatasheetField(datasheet, fipeId, 'Motor'),
      };
    };
  }

  execute(userId: string, carId: string): QueryDatasheetIO {
    return EitherIO.from(UnknownDomainError.toFn(), this._getCar(userId, carId))
      .filter(CarNotFoundError.toFn(), (myCar: MyCarProductWithUserDto) => myCar !== null)
      .filter(
        CarNotFoundError.toFn(),
        ({ status }: MyCarProductWithUserDto) =>
          status === MyCarProductStatusEnum.ACTIVE || status === MyCarProductStatusEnum.EXCLUDING,
      )
      .map(this._requestDatasheet())
      .map(this._getResponse())
      .filter(ProviderNoDataForSelectedVersion.toFn(), this._canBeParsed())
      .map(this._parseResponse());
  }
}
