import * as mongoose from 'mongoose';
import { getCurrentTestMongoUri } from './get-test-uri';

beforeEach(async () => {
  const url: string = getCurrentTestMongoUri();

  const connection: typeof mongoose = await mongoose.connect(url);

  // eslint-disable-next-line @typescript-eslint/typedef
  const collections = await connection.connection.db.collections();

  // eslint-disable-next-line prefer-const
  for (let collection of collections) {
    await collection.deleteMany({});
  }

  await connection.disconnect();
});

afterAll(async () => {
  const url: string = getCurrentTestMongoUri();

  const connection: typeof mongoose = await mongoose.connect(url);
  await connection.connection.db.dropDatabase();
  await connection.disconnect();
});
