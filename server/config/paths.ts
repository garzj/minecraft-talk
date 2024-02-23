import { existsSync } from 'fs';
import { join } from 'path';

export const rootDir =
  process.env.NODE_ENV === 'production'
    ? join(__dirname, '../../../../..')
    : join(__dirname, '../../..');

export const buildDir = join(rootDir, 'webapp/build');
export const buildDirExists = existsSync(buildDir);

export const indexFile = join(buildDir, 'index.html');
export const indexFileExists = buildDirExists && existsSync(indexFile);
