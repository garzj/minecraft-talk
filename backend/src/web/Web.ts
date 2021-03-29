import { middleware } from './middleware';
import { APIManager } from '../api/APIManager';
import { Application } from 'express';
import { routes } from './routes';

export class Web {
  app: Application;
  apiMgr: APIManager;

  constructor(app: Application, apiMgr: APIManager) {
    this.app = app;
    this.apiMgr = apiMgr;

    middleware(this.app);

    routes(this);
  }

  start() {
    const port = process.env.PORT;
    this.app.listen(port, () => console.log(`Listening on port ${port}.`));
  }
}
