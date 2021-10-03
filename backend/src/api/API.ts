import { Namespace, Socket } from 'socket.io';
import { APIConn } from './APIConn';
import { APIManager } from './APIManager';

export abstract class API<TAPIConn extends APIConn> {
  nsp: Namespace;
  apiConns: Set<TAPIConn> = new Set();

  constructor(
    public mgr: APIManager,
    apiPath: string,
    APIConnClass: new (mgr: APIManager, socket: Socket) => TAPIConn
  ) {
    this.nsp = this.mgr.io.of('/api/' + apiPath);

    this.nsp.on('connection', (socket) => {
      const apiConn = new APIConnClass(this.mgr, socket);
      this.apiConns.add(apiConn);

      socket.on('error', () => console.log(`Socket error: ${socket.id}`));

      socket.on('disconnect', () => {
        apiConn.onDisconnect?.();
        this.apiConns.delete(apiConn);
        socket.offAny();
      });
    });
  }
}
