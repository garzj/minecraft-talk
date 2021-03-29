import { API } from '../API';
import { APIManager } from '../APIManager';
import { serverAPIAuthenticator } from './authenticator';
import { ServerConn } from './ServerConn';

export class ServerAPI extends API {
  constructor(mgr: APIManager) {
    super(mgr, 'server', ServerConn);

    this.nsp.use(serverAPIAuthenticator);
  }
}
