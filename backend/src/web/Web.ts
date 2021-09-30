import { applyMiddleware } from './middleware';
import { APIManager } from '../api/APIManager';
import { Application } from 'express';
import { applyRoutes } from './routes';
import { Server } from 'http';

export class Web {
  server: Server;
  app: Application;
  apiMgr: APIManager;

  constructor(server: Server, app: Application, apiMgr: APIManager) {
    this.server = server;
    this.app = app;
    this.apiMgr = apiMgr;

    applyMiddleware(this.app);

    applyRoutes(this);
  }

  start() {
    const port = process.env.PORT;
    this.server.listen(port, () => console.log(`Listening on port ${port}.`));
  }
}
