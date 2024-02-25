import { existsSync } from 'fs';
import { join } from 'path';

export const rootDir = process.cwd();

export const clientDir = join(rootDir, 'build/client');
export const clientDirExists = existsSync(clientDir);

export const indexFile = join(clientDir, 'index.html');
export const indexFileExists = clientDirExists && existsSync(indexFile);
