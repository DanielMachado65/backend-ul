export enum DeviceKind {
  COMPUTER = 'computer',
  MOBILE = 'mobile',
  UNKNOWN = 'unknown',
}

export type DeviceInfoData = {
  readonly deviceKind: DeviceKind;
  readonly userAgent: string | null;
};
