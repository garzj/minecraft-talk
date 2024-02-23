import { NestedMap } from '../../../shared/map/NestedMap';
import { API } from '../API';
import { APIManager } from '../APIManager';
import { AuthedClient } from './AuthedClient';
import { ClientConn } from './ClientConn';

export class ClientAPI extends API<ClientConn> {
  authedClients: NestedMap<AuthedClient> = new NestedMap();
  activeClients: Map<string, AuthedClient> = new Map();

  constructor(mgr: APIManager) {
    super(mgr, 'client', ClientConn);
  }

  logoutPlayer(uuid: string): boolean {
    this.authedClients.forEach(uuid, (client) => client.logout());
    return true;
  }
}
