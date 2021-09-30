import { hasOwnProperty } from '../../bin/helpers';
import { API } from '../API';
import { APIManager } from '../APIManager';
import { AuthedClient } from './AuthedClient';
import { ClientConn } from './ClientConn';

export class ClientAPI extends API<ClientConn> {
  clients: { [uuid: string]: { [id: string]: AuthedClient } } = {};

  constructor(mgr: APIManager) {
    super(mgr, 'client', ClientConn);
  }

  clientsAsList() {
    const clientList: AuthedClient[] = [];

    for (let userClients of Object.values(this.clients)) {
      clientList.push(...Object.values(userClients));
    }

    return clientList;
  }

  logoutUser(uuid: string): boolean {
    if (!hasOwnProperty(this.clients, uuid)) return true;

    const affectedClients = Object.values(this.clients[uuid]);
    for (let client of affectedClients) {
      client.logout();
    }
    return true;
  }
}
