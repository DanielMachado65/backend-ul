export type EmbedInfo = {
  readonly embedUrl: string;
  readonly title: string;
  readonly url: string;
};

export abstract class VideoPlatformService {
  abstract getEmbedInfo(url: string): Promise<EmbedInfo | null>;
}
