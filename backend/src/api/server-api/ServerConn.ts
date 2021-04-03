import { Socket } from 'socket.io';
import { signObj } from '../../bin/sign-obj';
import { APIConn } from '../APIConn';
import { APIManager } from '../APIManager';
import { ClientAPI } from '../client-api/ClientAPI';

export class ServerConn extends APIConn {
  constructor(mgr: APIManager, socket: Socket) {
    super(mgr, socket);

    socket.on('login', (uuid: string, ack: (link: string) => void) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const token = signObj({
        createdAt: new Date().getTime(),
        expiredAt: tomorrow.getTime(),
        uuid,
      });

      const encodedToken = encodeURIComponent(token);
      const link = `${process.env.ORIGIN}login/?token=${encodedToken}`;

      ack(link);
    });

    socket.on('logout', (uuid, ack: (success: boolean) => void) => {
      ack((this.mgr.apis.client as ClientAPI).logoutUser(uuid));
    });

    socket.on('update-vols', (uuid, vols: [[string, number]]) => {
      // TODO: Implement me
    });
  }
}
