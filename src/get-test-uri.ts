export function getCurrentTestMongoUri(): string {
  const reg: RegExp = /(?<=\/)([\w\-]+)((?:\.[\w\-]+)*)\.spec(\.[\w\-]+)/;
  const path: string = expect.getState().testPath;
  const match: RegExpMatchArray = path.match(reg);
  const nameFile: string = match[1] + (match[2] ? match[2] : '');
  const opts: string = typeof process.env.MONGO_BASE_OPTS === 'string' ? process.env.MONGO_BASE_OPTS : '';
  const url: string = process.env.MONGO_BASE_URI + nameFile.replace(/\./g, '_') + opts;

  return url;
}
