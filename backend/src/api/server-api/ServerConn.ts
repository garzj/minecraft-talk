import { Socket } from 'socket.io';
import { signObj } from '../../bin/sign-obj';
import { APIConn } from '../APIConn';
import { APIManager } from '../APIManager';
import { ClientConn } from '../client-api/ClientConn';

export class ServerConn extends APIConn {
  constructor(mgr: APIManager, socket: Socket) {
    super(mgr, socket);

    socket.on('login', (uuid: string, ack: (link: string) => void) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const token = signObj({
        createdAt: new Date().toString(),
        expiresAt: tomorrow.toString(),
        uuid,
      });

      const encodedToken = encodeURIComponent(token);
      const link = `${process.env.ORIGIN}login/?token=${encodedToken}`;

      ack(link);
    });

    socket.on('logout', (uuid, ack: (success: boolean) => void) => {
      // I could also invalidate the token somehow...
      // But I'm just gonna emit a logout to the connected
      // clients and let all other tokens expire

      this.mgr.apis.client.conns.forEach((apiConn) => {
        if ((apiConn as ClientConn).uuid === uuid) {
          apiConn.socket.emit('logout');
        }
      });

      ack(true);
    });

    socket.on('update-vols', (uuid, vols: [[string, number]]) => {
      // TODO: Implement me
    });
  }
}
