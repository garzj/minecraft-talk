import { Socket } from 'socket.io';
import { APIConn } from '../APIConn';
import { APIManager } from '../APIManager';
import { ClientAPI } from './ClientAPI';
import * as cookieParser from 'cookie-parser';
import { validateToken } from '../../bin/validate-token';
export class ClientConn extends APIConn {
  uuid!: string;

  constructor(mgr: APIManager, socket: Socket) {
    super(mgr, socket);

    // Auth
    const req: any = socket.request;
    cookieParser(process.env.TOKEN_SECRET)(req, {} as any, () => {});
    const signedCookies: { [name: string]: any } = req.signedCookies;

    if (validateToken(signedCookies.token)) {
      this.uuid = signedCookies.token.uuid;

      socket.emit('logged-in', this.uuid);

      this.loggedIn();
    } else {
      socket.emit('token-expired');

      socket.disconnect();
    }
  }

  logout() {
    this.socket.emit('logout');

    this.socket.disconnect();
  }

  loggedIn() {
    this.socket.on('logout', () => {
      (this.mgr.apis.client as ClientAPI).logoutUser(this.uuid);
    });
  }
}
