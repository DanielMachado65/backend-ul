import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, firstValueFrom } from 'rxjs';
import { EmbedInfo, VideoPlatformService } from 'src/domain/_layer/infrastructure/service/video-platform.service';

type YoutubeEmbedInfo = {
  readonly title: string;
  readonly author_name: string;
  readonly author_url: string;
  readonly type: string;
  readonly height: number;
  readonly width: number;
  readonly version: string;
  readonly provider_name: string;
  readonly provider_url: string;
  readonly thumbnail_height: number;
  readonly thumbnail_width: number;
  readonly thumbnail_url: string;
  readonly html: string;
};

@Injectable()
export class YoutubeService implements VideoPlatformService {
  constructor(private readonly _httpService: HttpService) {}

  async getEmbedInfo(url: string): Promise<EmbedInfo | null> {
    const response$: Observable<AxiosResponse<YoutubeEmbedInfo>> = this._httpService.get(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
    );
    const response: AxiosResponse<YoutubeEmbedInfo> = await firstValueFrom(response$);

    return response.status === 200 ? YoutubeService._parseYoutubeEmbedInfo(url, response.data) : null;
  }

  private static _parseYoutubeEmbedInfo(url: string, info: YoutubeEmbedInfo): EmbedInfo {
    return {
      embedUrl: YoutubeService._makeEmbedUrl(url),
      title: info.title,
      url: url,
    };
  }

  private static _makeEmbedUrl(url: string): string {
    const [videoId]: ReadonlyArray<string> = url.match(/(?<=v=).+?(?=&|$)/);
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }
}
