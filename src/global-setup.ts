import { MongoMemoryServer } from 'mongodb-memory-server';
import * as dotenv from 'dotenv';

export = async function globalSetup(): Promise<void> {
  dotenv.config({ path: '.env.test' });

  // Config to decided if an mongodb-memory-server instance should be used
  // it's needed in global space, because we don't want to create a new instance every test-suite
  if (!process.env.MONGO_BASE_URI) {
    const instance: MongoMemoryServer = await MongoMemoryServer.create();
    const uri: string = instance.getUri();
    // eslint-disable-next-line functional/immutable-data
    (global as unknown as Record<string, unknown>).__MONGOINSTANCE = instance;
    // eslint-disable-next-line functional/immutable-data, require-atomic-updates
    process.env.MONGO_BASE_URI = uri.slice(0, uri.lastIndexOf('/')) + '/';
  }
};
