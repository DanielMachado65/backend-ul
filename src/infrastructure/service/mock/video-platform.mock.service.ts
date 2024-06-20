import { Injectable } from '@nestjs/common';
import { EmbedInfo, VideoPlatformService } from 'src/domain/_layer/infrastructure/service/video-platform.service';

@Injectable()
export class VideoPlatformMockService implements VideoPlatformService {
  getEmbedInfo(_url: string): Promise<EmbedInfo> {
    throw new Error('Method not implemented.');
  }
}
