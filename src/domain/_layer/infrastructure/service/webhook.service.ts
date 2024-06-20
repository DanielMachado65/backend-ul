export abstract class WebhookService {
  abstract sendMany(urls: string[], data: unknown): Promise<void>;
}
