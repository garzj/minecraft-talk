import cookieParser from 'cookie-parser';
import { Application } from 'express';

export function applyMiddleware(app: Application) {
  app.use(cookieParser(process.env.TOKEN_SECRET));
}
