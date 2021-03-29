import * as dotenv from 'dotenv';
dotenv.config();

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      CONVERSATION_SECRET: string;
      TOKEN_SECRET: string;
      PORT: string;
      ORIGIN: string;
    }
  }
}

process.env.NODE_ENV ??= 'production';
process.env.PORT ??= '3030';
process.env.CONVERSATION_SECRET ??= 'LhKB7U1svggGYx7ZGaLb';
process.env.TOKEN_SECRET ??= 'eum4Yqm65TndzWLJr0Br';
process.env.ORIGIN ??= 'http://localhost:3030/';

// Ensure exactly one trailing /
process.env.ORIGIN = process.env.ORIGIN.replace(/\/*$/, '/');
