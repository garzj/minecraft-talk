import { Socket } from 'socket.io';
import { hasOwnProperty } from '../../bin/util';
import { validateToken } from '../../bin/token/validate-token';
import { APIConn } from '../APIConn';
import { APIManager } from '../APIManager';
import { clientAPIAuthenticator } from './authenticator';
import { AuthedClient } from './AuthedClient';

export class ClientConn extends APIConn {
  authedClient?: AuthedClient;

  constructor(apiMgr: APIManager, socket: Socket) {
    super(apiMgr, socket);

    this.auth();
  }

  private auth() {
    // Authorize client
    const token = clientAPIAuthenticator(this.socket);
    if (!token) return;

    const client = new AuthedClient(this.mgr, this, token);
    this.authedClient = client;

    // Add it to the authedClient map
    this.mgr.clientApi.authedClients.set(token.uuid, this.socket.id, client);

    // Check for expiration on every api request
    this.socket.use((e, next) => {
      const msg: string = e[0];

      if (this.authedClient) {
        const validToken = validateToken(this.authedClient.token);

        if (validToken) {
          msg === 'check-token' && this.socket.emit('logged-in');

          return next();
        }
      }

      this.socket.emit('token-expired');
      this.unauth();
    });
  }

  unauth() {
    if (!this.authedClient) return;

    this.socket.offAny();

    // Destroy client
    const client = this.authedClient;
    delete this.authedClient;
    client.destroy();

    // Remove it from the authedClient map
    this.mgr.clientApi.authedClients.unset(client.token.uuid, this.socket.id);
  }

  onDisconnect() {
    this.unauth();
  }
}
