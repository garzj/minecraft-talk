import { Namespace, Socket } from 'socket.io';
import { APIConn } from './APIConn';
import { APIManager } from './APIManager';

export abstract class API {
  mgr: APIManager;
  nsp: Namespace;
  conns: APIConn[] = [];

  constructor(mgr: APIManager, apiPath: string, APIConnClass: typeof APIConn) {
    this.mgr = mgr;
    this.nsp = this.mgr.io.of('/api/' + apiPath);

    this.nsp.on('connection', (socket) => {
      const conn = new APIConnClass(this.mgr, socket);
      this.conns.push(conn);

      socket.on('disconnect', () => {
        this.conns = this.conns.filter((c) => c !== conn);
        socket.offAny();
      });
    });
  }
}
