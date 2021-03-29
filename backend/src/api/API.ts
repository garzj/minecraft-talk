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
      this.conns.push(new APIConnClass(this.mgr, socket));
    });
  }
}
