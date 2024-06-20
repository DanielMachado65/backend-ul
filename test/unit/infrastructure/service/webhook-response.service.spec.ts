import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';

import { WebhookService } from 'src/domain/_layer/infrastructure/service/webhook.service';
import { WebhookResponseService } from 'src/infrastructure/service/webhook-response.service';

describe('WebhookResponseService', () => {
  let sut: WebhookResponseService;
  let module: TestingModule;
  let httpService: HttpService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: WebhookService,
          useClass: WebhookResponseService,
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = await module.resolve(WebhookService);
  });

  beforeEach(() => {
    httpService = module.get(HttpService);
  });

  describe('#sendMany', () => {
    test('should call sendMany two times', () => {
      const urls: string[] = ['any_url_1', 'any_url_2'];
      const data: unknown = { a: 1, b: 2 };
      sut.sendMany(urls, data);

      expect(httpService.post).toHaveBeenCalledTimes(2);
      urls.forEach((e: string) => {
        expect(httpService.post).toHaveBeenCalledWith(e, data);
      });
    });

    test('should return void', async () => {
      const urls: string[] = ['any_url_1', 'any_url_2'];
      const data: unknown = { a: 1, b: 2 };
      const result: Promise<void> = sut.sendMany(urls, data);

      expect(result).resolves.toBeUndefined();
    });
  });
});
