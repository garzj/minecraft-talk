import { applyMiddleware } from './middleware';
import { Application } from 'express';
import { applyRoutes } from './routes';
import { Server } from 'http';

export class Web {
  constructor(public server: Server, public app: Application) {
    applyMiddleware(this.app);

    applyRoutes(this.app);
  }

  start() {
    const port = process.env.PORT;
    this.server.listen(port, () => console.log(`Listening on port ${port}.`));
  }
}
