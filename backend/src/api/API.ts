import { Namespace, Socket } from 'socket.io';
import { APIConn } from './APIConn';
import { APIManager } from './APIManager';
import { APIName } from './APIName';

export abstract class API {
  mgr: APIManager;
  nsp: Namespace;
  conns: APIConn[] = [];

  constructor(mgr: APIManager, apiName: APIName, APIConnClass: typeof APIConn) {
    this.mgr = mgr;
    this.nsp = this.mgr.io.of('/api/' + apiName);

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
