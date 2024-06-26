import { DateOrNull, NumberOrNull, StringOrNull } from 'src/domain/types';

export type RestictionObject = {
  readonly name: string;
  readonly description: StringOrNull;
  readonly value: number;
} | null;

export type NationalBaseRestictions = {
  readonly restriction1: RestictionObject;
  readonly restriction2: RestictionObject;
  readonly restriction3: RestictionObject;
  readonly restriction4: RestictionObject;
  readonly othersRestrictions1: RestictionObject;
  readonly othersRestrictions2: RestictionObject;
  readonly othersRestrictions3: RestictionObject;
  readonly othersRestrictions4: RestictionObject;
  readonly othersRestrictions5: RestictionObject;
  readonly othersRestrictions6: RestictionObject;
  readonly othersRestrictions7: RestictionObject;
  readonly othersRestrictions8: RestictionObject;
  readonly occurrenceTheft: RestictionObject;
  readonly importation: RestictionObject;
  readonly salesCommunication: RestictionObject;
  readonly restrictionsRenajud: RestictionObject;
  readonly restrictionsFinan: RestictionObject;
  readonly restrictionsAgentName: RestictionObject;
  readonly restrictionsFinanced: RestictionObject;
  readonly cpfCnpjFinanced: RestictionObject;
  readonly occurrence: RestictionObject;
  readonly restrictions: RestictionObject;
  readonly restrictionsJudicial: RestictionObject;
};

export type NationalBaseVo = {
  readonly plate: StringOrNull;
  readonly chassis: StringOrNull;
  readonly renavam: StringOrNull;
  readonly engineNumber: StringOrNull;
  readonly transmissionNumber: StringOrNull;
  readonly bodyNumber: StringOrNull;
  readonly bodyType: StringOrNull;
  readonly rearAxisNumber: StringOrNull;
  readonly thireAxisNumber: StringOrNull;
  readonly axis: StringOrNull;
  readonly enginePower: StringOrNull;
  readonly modelYear: NumberOrNull;
  readonly manufactureYear: NumberOrNull;
  readonly vehicleSpecie: StringOrNull;
  readonly vehicleType: StringOrNull;
  readonly vehicleSituation: StringOrNull;
  readonly city: StringOrNull;
  readonly uf: StringOrNull;
  readonly ufBilled: StringOrNull;
  readonly billedDocType: StringOrNull;
  readonly importDocType: StringOrNull;
  readonly di: StringOrNull;
  readonly loadCapacity: StringOrNull;
  readonly cmt: StringOrNull;
  readonly pbt: StringOrNull;
  readonly docBilled: StringOrNull;
  readonly color: StringOrNull;
  readonly species: StringOrNull;
  readonly chassisBrandType: StringOrNull;
  readonly category: StringOrNull;
  readonly fuel: StringOrNull;
  readonly ownerDoc: StringOrNull;
  readonly cylinder: StringOrNull;
  readonly modelCode: StringOrNull;
  readonly brand: StringOrNull;
  readonly model: StringOrNull;
  readonly provenance: StringOrNull;
  readonly brandModel: StringOrNull;
  readonly licensePlateDate: DateOrNull;
  readonly mountingType: StringOrNull;
  readonly loadPassengers: NumberOrNull;
  readonly lastUpdateDate: DateOrNull;
  readonly inclusionRestrictionDate: DateOrNull;
  readonly dateOfTheLicense: DateOrNull;
  readonly taxRestrictionDate: DateOrNull;
  readonly restrictions: NationalBaseRestictions;
};
