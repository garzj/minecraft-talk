import { middleware } from './middleware';
import * as express from 'express';
import { APIManager } from '../api/APIManager';

export class Web {
  app: express.Application;
  apiMgr: APIManager;

  constructor(app: express.Application, apiMgr: APIManager) {
    this.app = app;
    this.apiMgr = apiMgr;

    middleware(this.app);
  }

  start() {
    const port = process.env.PORT;
    this.app.listen(port, () => console.log(`Listening on port ${port}.`));
  }
}
