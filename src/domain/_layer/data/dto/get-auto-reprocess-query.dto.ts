type QueryStatus = 'SUCCESS' | 'PROCCESSING' | 'EXPIRED_TIME';

export type GetAutoReprocessQueryDto = {
  readonly status: QueryStatus;
  readonly createdAt: Date;
};
