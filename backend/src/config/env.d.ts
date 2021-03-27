declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    CONVERSATION_SECRET: string;
    PORT: string;
  }
}
