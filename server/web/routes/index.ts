import { Application } from 'express';
import { loginRouter } from './login';
import { webAppRouter } from './webapp';

export function applyRoutes(app: Application) {
  app.use(loginRouter);
  app.use(webAppRouter);
}
