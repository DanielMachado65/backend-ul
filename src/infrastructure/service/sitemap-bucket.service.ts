import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { FileContent, PublicSiteStorage } from 'src/domain/_layer/infrastructure/service/public-site-storage.service';
import { ENV_KEYS, EnvService } from '../framework/env.service';

@Injectable()
export class SiteBucketService implements PublicSiteStorage {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endpoint: string;

  constructor(private readonly _envService: EnvService) {
    this.accessKeyId = this._envService.get(ENV_KEYS.BUCKET_SITEMAP_ACCESS_KEY_ID);
    this.secretAccessKey = this._envService.get(ENV_KEYS.BUCKET_SITEMAP_SECRET_ACCESS_KEY);
    this.region = this._envService.get(ENV_KEYS.BUCKET_SITEMAP_REGION);
    this.endpoint = this._envService.get(ENV_KEYS.BUCKET_SITEMAP_ENDPOINT);
  }

  async saveFile(filename: string, type: string, content: FileContent): Promise<void> {
    const s3: S3 = new S3({
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
      region: this.region,
      endpoint: this.endpoint,
    });

    await s3
      .upload(
        {
          Bucket: 'onc-site-static-files',
          Key: filename,
          Body: content,
          ACL: 'public-read-write',
          ContentType: type,
        },
        { leavePartsOnError: false },
      )
      .promise();
  }
}
