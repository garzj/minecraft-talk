import { API } from '../API';
import { APIManager } from '../APIManager';
import { ClientConn } from './ClientConn';

export class ClientAPI extends API {
  constructor(mgr: APIManager) {
    super(mgr, 'client', ClientConn);
  }

  logoutUser(uuid: string): boolean {
    this.conns.forEach((apiConn) => {
      const clientConn = apiConn as ClientConn;
      if (clientConn.token?.uuid === uuid) {
        clientConn.logout();
      }
    });

    return true;
  }
}
