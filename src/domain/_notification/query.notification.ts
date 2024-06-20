export class QuerySuccessNotification {
  email: string;
  name: string;
  queryId: string;
  queryCode: number;
  queryName: string;
}

export class QueryFailNotification {
  email: string;
  name: string;
  queryName: string;
}
