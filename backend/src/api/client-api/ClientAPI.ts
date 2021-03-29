import { Socket } from 'socket.io';
import { API } from '../API';
import { APIManager } from '../APIManager';
import { ClientConn } from './ClientConn';

export class ClientAPI extends API {
  constructor(mgr: APIManager) {
    super(mgr, 'client', ClientConn);
  }

  logoutUser(uuid: string, from?: Socket): boolean {
    // I could also invalidate the token somehow...
    // But I'm just gonna emit a logout to the connected
    // clients and let all other tokens expire

    this.conns.forEach((apiConn) => {
      if ((apiConn as ClientConn).uuid === uuid) {
        if (from) {
          from.broadcast.emit('logout');
        } else {
          apiConn.socket.emit('logout');
        }
      }
    });

    return true;
  }
}
