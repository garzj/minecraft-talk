import * as dotenv from 'dotenv';
dotenv.config({ path: ['./.env', '../.env'] });

declare global {
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

process.env.ORIGIN ??= 'http://localhost:8080/';
process.env.ORIGIN = process.env.ORIGIN.replace(/\/*$/, '/');

if (!process.env.CONVERSATION_SECRET) {
  console.error('Please specify a CONVERSATION_SECRET.');
  process.exit(1);
}
if (!process.env.TOKEN_SECRET) {
  console.error('Please specify a TOKEN_SECRET.');
  process.exit(1);
}
