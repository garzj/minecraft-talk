import { Namespace, Socket } from 'socket.io';
import { APIConn } from './APIConn';
import { APIManager } from './APIManager';

export abstract class API<TAPIConn extends APIConn> {
  mgr: APIManager;
  nsp: Namespace;
  conns: TAPIConn[] = [];

  constructor(
    mgr: APIManager,
    apiPath: string,
    APIConnClass: new (mgr: APIManager, socket: Socket) => TAPIConn
  ) {
    this.mgr = mgr;
    this.nsp = this.mgr.io.of('/api/' + apiPath);

    this.nsp.on('connection', (socket) => {
      const conn = new APIConnClass(this.mgr, socket);
      this.conns.push(conn);

      socket.on('disconnect', () => {
        conn.onDisconnect && conn.onDisconnect();

        this.conns = this.conns.filter((c) => c !== conn);
        socket.offAny();
      });
    });
  }
}
