import { NestedMap } from '@shared/map/NestedMap';
import { RelationMap } from '@shared/map/RelationMap';
import { API } from '../API';
import { APIManager } from '../APIManager';
import { AuthedClient } from './AuthedClient';
import { ClientConn } from './ClientConn';
import { RTCConnection } from './RTCConnection';

export class ClientAPI extends API<ClientConn> {
  authedClients: NestedMap<AuthedClient> = new NestedMap();
  rtcConns: RelationMap<RTCConnection> = new RelationMap();

  constructor(mgr: APIManager) {
    super(mgr, 'client', ClientConn);
  }

  logoutPlayer(uuid: string): boolean {
    this.authedClients.forEach(uuid, (client) => client.logout());
    return true;
  }
}
