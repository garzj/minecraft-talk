import { existsSync } from 'fs';
import { join } from 'path';

export const buildDir = join(__dirname, '../../../webapp/build/');
export const buildDirExists = existsSync(buildDir);

export const indexFile = join(buildDir, 'index.html');
export const indexFileExists = buildDirExists && existsSync(indexFile);
