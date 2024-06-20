import { Injectable } from '@nestjs/common';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { MyCarQueryMainFlaws } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { QueryMainFlawsDomain, QueryMainFlawsIO } from 'src/domain/core/product/query-main-flaws.domain';
import {
  VehicleDiagnosticCrashListData,
  VehicleDiagnosticSolution,
} from 'src/domain/value-object/vehicle-diagnostic.vo';
import { MyCarsQueryHelper } from './my-cars-query.helper';

@Injectable()
export class QueryMainFlawsUseCase implements QueryMainFlawsDomain {
  private static readonly TEMPLATE_QUERY: string = '4';

  constructor(private readonly _helper: MyCarsQueryHelper) {}

  execute(userId: string, carId: string): QueryMainFlawsIO {
    return this._helper
      .getCar(userId, carId)
      .map(this._helper.requestQuery(QueryMainFlawsUseCase.TEMPLATE_QUERY))
      .map(this._helper.getResponse())
      .filter(ProviderUnavailableDomainError.toFn(), this._helper.isValidQuery())
      .map(this._parseResponse());
  }

  private _parseResponse(): (dto: QueryResponseDto) => MyCarQueryMainFlaws {
    return ({ response }: QueryResponseDto): MyCarQueryMainFlaws => {
      const generic: ReadonlyArray<VehicleDiagnosticCrashListData> = Array.isArray(response.vehicleDiagnostic?.generic)
        ? response.vehicleDiagnostic?.generic
        : [];

      return {
        flaws: generic.map((item: VehicleDiagnosticCrashListData) => ({
          description: item.description,
          occurrencePercent: this._toPercentValue(item.occurrencesPercentage),
          analysisCount: item.totalDiagnostics,
          identifiedFlawsCount: item.occurrences,
          solution:
            item.solutions.map((solution: VehicleDiagnosticSolution) => solution.description).join(' | ') || '-',
        })),
      };
    };
  }

  private _toPercentValue(value: string): number {
    const updatedValue: string = value.replace(',', '.');
    return parseFloat((parseFloat(updatedValue) / 100).toFixed(4));
  }
}
