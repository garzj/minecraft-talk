import { Socket } from 'socket.io';
import { APIManager } from './APIManager';

export class APIConn {
  mgr: APIManager;
  socket: Socket;

  constructor(apiMgr: APIManager, socket: Socket) {
    this.mgr = apiMgr;
    this.socket = socket;
  }

  onDisconnect?(): void;
}
