import { Injectable, Scope } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosInstance } from 'axios';
import { setupCache } from 'axios-cache-interceptor';

@Injectable({ scope: Scope.TRANSIENT })
export class CacheHttpService extends HttpService {
  constructor(axiosInstance: AxiosInstance) {
    super(axiosInstance);
    setupCache(axiosInstance);
  }
}
