import { Injectable } from '@nestjs/common';
import { FileContent, PublicSiteStorage } from 'src/domain/_layer/infrastructure/service/public-site-storage.service';

@Injectable()
export class SiteBucketMockService implements PublicSiteStorage {
  async saveFile(_filename: string, _type: string, _content: FileContent): Promise<void> {
    return Promise.resolve();
  }
}
