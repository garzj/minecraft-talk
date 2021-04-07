import { Socket } from 'socket.io';
import { signObj } from '../../bin/sign-obj';
import { APIConn } from '../APIConn';
import { APIManager } from '../APIManager';
import { Token } from '../../bin/Token';

export class ServerConn extends APIConn {
  constructor(mgr: APIManager, socket: Socket) {
    super(mgr, socket);

    this.api();
  }

  api() {
    this.socket.on(
      'login',
      (uuid: string, name: string, ack: (link: string) => void) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const token: Token = {
          createdAt: new Date().getTime(),
          expiredAt: tomorrow.getTime(),
          name,
          uuid,
        };

        const signedToken = signObj(token);

        const encodedToken = encodeURIComponent(signedToken);
        const link = `${process.env.ORIGIN}login/?token=${encodedToken}`;

        ack(link);
      }
    );

    this.socket.on('logout', (uuid, ack: (success: boolean) => void) => {
      ack(this.mgr.clientApi.logoutUser(uuid));
    });

    this.socket.on('update-vols', (uuid, vols: [[string, number]]) => {
      // TODO: Implement me
    });
  }
}
