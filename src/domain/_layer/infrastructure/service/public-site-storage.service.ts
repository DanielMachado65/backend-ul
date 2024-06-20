import { Readable } from 'stream';

export type FileContent = Buffer | Uint8Array | Blob | string | Readable;

export abstract class PublicSiteStorage {
  abstract saveFile(filename: string, file: string, content: FileContent): Promise<void>;
}
