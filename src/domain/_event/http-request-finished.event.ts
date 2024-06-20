import { HttpLogDto } from '../_layer/data/dto/http-log.dto';

export type HttpRequestFinishedEvent = {
  readonly httpLog: HttpLogDto;
};
