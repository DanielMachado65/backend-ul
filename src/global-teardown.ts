import { MongoMemoryServer } from 'mongodb-memory-server';

export = async function globalTeardown(): Promise<void> {
  // Config to decided if an mongodb-memory-server instance should be used
  const instance: MongoMemoryServer = (global as unknown as Record<string, unknown>)
    .__MONGOINSTANCE as MongoMemoryServer | null;
  await instance?.stop();
};
