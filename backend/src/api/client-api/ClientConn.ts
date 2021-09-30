import { Socket } from 'socket.io';
import { hasOwnProperty } from '../../bin/helpers';
import { validateToken } from '../../bin/validate-token';
import { APIConn } from '../APIConn';
import { APIManager } from '../APIManager';
import { clientAPIAuthenticator } from './authenticator';
import { AuthedClient } from './AuthedClient';

export class ClientConn extends APIConn {
  authedClient?: AuthedClient;

  constructor(apiMgr: APIManager, socket: Socket) {
    super(apiMgr, socket);

    this.setupAuth();
  }

  private setupAuth() {
    // Check auth on every api request
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

    // Authorize client
    const token = clientAPIAuthenticator(this.socket);
    if (!token) return;

    const client = new AuthedClient(this, token);
    this.authedClient = client;

    // Add it to the client list
    const uuid = token.uuid;
    const clients = this.apiMgr.clientApi.clients;

    if (!hasOwnProperty(clients, uuid)) {
      clients[uuid] = {};
    }
    clients[uuid][uuid] = client;
  }

  unauth() {
    if (!this.authedClient) return;

    this.socket.offAny();

    // Remove client references
    const client = this.authedClient;
    delete this.authedClient;

    const uuid = client.token.uuid;
    const clients = this.apiMgr.clientApi.clients;

    if (!hasOwnProperty(clients, uuid)) return;
    const userClients = clients[uuid];

    if (!hasOwnProperty(userClients, client.getId())) return;
    delete userClients[client.getId()];

    if (Object.keys(clients[uuid]).length !== 0) return;
    delete clients[uuid];
  }

  onDisconnect() {
    this.unauth();
  }
}
