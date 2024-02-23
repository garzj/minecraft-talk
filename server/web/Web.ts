import { Application } from 'express';
import { Server } from 'http';
import { applyMiddleware } from './middleware';
import { applyRoutes } from './routes';

export class Web {
  constructor(
    public server: Server,
    public app: Application,
  ) {
    applyMiddleware(this.app);

    applyRoutes(this.app);
  }

  start() {
    const port = process.env.PORT;
    this.server.listen(port, () => console.log(`Listening on port ${port}.`));
  }
}
