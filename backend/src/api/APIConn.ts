import { Socket } from 'socket.io';
import { APIManager } from './APIManager';

export class APIConn {
  mgr: APIManager;
  socket: Socket;

  constructor(mgr: APIManager, socket: Socket) {
    this.mgr = mgr;
    this.socket = socket;
  }
}
