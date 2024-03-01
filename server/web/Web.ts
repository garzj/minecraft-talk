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
    const port = parseInt(process.env.LISTEN_PORT);
    this.server.listen(port, process.env.LISTEN_ADDR, () => console.log(`Listening on port ${port}.`));
  }
}
