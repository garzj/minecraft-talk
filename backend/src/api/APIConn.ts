import { Socket } from 'socket.io';
import { APIManager } from './APIManager';

export class APIConn {
  apiMgr: APIManager;
  socket: Socket;

  constructor(apiMgr: APIManager, socket: Socket) {
    this.apiMgr = apiMgr;
    this.socket = socket;
  }

  onDisconnect?(): void;
}
