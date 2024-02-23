import * as dotenv from 'dotenv';
dotenv.config({ path: ['./.env', '../.env'] });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      ORIGIN: string;
      CONVERSATION_SECRET: string;
      TOKEN_SECRET: string;
    }
  }
}

process.env.NODE_ENV ??= 'production';
process.env.PORT ??= '8080';

const errs: string[] = [];
if (process.env.NODE_ENV === 'production') {
  if (!process.env.ORIGIN) {
    errs.push('Please specify an ORIGIN.');
  }

  if (!process.env.CONVERSATION_SECRET) {
    errs.push('Please specify a CONVERSATION_SECRET.');
  }
  if (!process.env.TOKEN_SECRET) {
    errs.push('Please specify a TOKEN_SECRET.');
  }
}
if (errs.length > 0) {
  console.error('Exiting.');
  process.exit(1);
}

process.env.ORIGIN ??= 'http://localhost:8080/';
process.env.ORIGIN = process.env.ORIGIN.replace(/\/*$/, '/');

process.env.CONVERSATION_SECRET ??= 'supersecuresecret';
process.env.TOKEN_SECRET ??= 'supersecuresecret';
