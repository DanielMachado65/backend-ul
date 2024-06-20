import { AccessoryVo } from 'src/domain/value-object/accessory.vo';
import { BasicPackVo } from 'src/domain/value-object/basic-pack.vo';
import { BasicVehicleDataCollection, BasicVehicleVo } from 'src/domain/value-object/basic-vechicle.vo';
import { DatasheetVo } from 'src/domain/value-object/datasheet.vo';
import { QueryAccessoryVo } from 'src/domain/value-object/query/query-accessory.vo';
import { QueryBasicPackVo } from 'src/domain/value-object/query/query-basic-pack.vo';
import { QueryBasicVehicleDataVo } from 'src/domain/value-object/query/query-basic-vehicle.vo';
import { QueryDatasheetVo } from 'src/domain/value-object/query/query-datasheet.vo';
import { QueryRevisionVo } from 'src/domain/value-object/query/query-revision.vo';
import { RevisionVo } from 'src/domain/value-object/revision.vo';
import { AccessoriesParser } from 'src/infrastructure/service/query/parser/accessories-parser';
import { BasicPackParser } from 'src/infrastructure/service/query/parser/basic-pack-parser';
import { BasicVehicleParser } from 'src/infrastructure/service/query/parser/basic-vehicle-parser';
import { DataSheetParser } from 'src/infrastructure/service/query/parser/datasheet-parser';
import { RevisionParser } from 'src/infrastructure/service/query/parser/revision-parser';

export type SpecialDatasheetVo = {
  readonly accessories: ReadonlyArray<AccessoryVo>;
  readonly basicPack: ReadonlyArray<BasicPackVo>;
  readonly basicVehicle: BasicVehicleVo;
  readonly datasheet: ReadonlyArray<DatasheetVo>;
  readonly revision: ReadonlyArray<RevisionVo>;
};

export type QuerySpecialDatasheetVo = {
  readonly acessorios: QueryAccessoryVo;
  readonly cestaBasica: QueryBasicPackVo;
  readonly dadosBasicosDoVeiculo: QueryBasicVehicleDataVo;
  readonly fichaTecnica: QueryDatasheetVo;
  readonly revisao: QueryRevisionVo;
};

export class SpecialDataSheetParser {
  static parse({
    accessories,
    basicPack,
    basicVehicle,
    datasheet,
    revision,
  }: SpecialDatasheetVo): QuerySpecialDatasheetVo {
    let queryAccessories: QueryAccessoryVo = null;
    const queryBasicPack: QueryBasicPackVo = BasicPackParser.parse(basicPack);
    const queryBasicvehicle: QueryBasicVehicleDataVo = BasicVehicleParser.parse(basicVehicle);
    const queryDatasheet: QueryDatasheetVo = DataSheetParser.parse(datasheet);
    const queryRevision: QueryRevisionVo = RevisionParser.parse(revision);

    const dataCollection: ReadonlyArray<BasicVehicleDataCollection> = basicVehicle?.dataCollection;

    if (basicVehicle !== null && basicVehicle !== undefined && dataCollection?.length > 0) {
      queryAccessories = AccessoriesParser.parse(accessories, dataCollection);
    }

    return {
      acessorios: queryAccessories,
      cestaBasica: queryBasicPack,
      dadosBasicosDoVeiculo: queryBasicvehicle,
      fichaTecnica: queryDatasheet,
      revisao: queryRevision,
    };
  }
}
