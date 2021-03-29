import { Socket } from 'socket.io';
import { APIConn } from '../APIConn';
import { APIManager } from '../APIManager';

export class ClientConn extends APIConn {
  uuid: string | null = null;

  constructor(mgr: APIManager, socket: Socket) {
    super(mgr, socket);
  }
}
