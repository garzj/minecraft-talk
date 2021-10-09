import { RelationMap } from '@shared/map/RelationMap';
import { API } from '../API';
import { APIManager } from '../APIManager';
import { serverAPIAuthenticator } from './authenticator';
import { ClientConnection } from '../client-api/ClientConnection';
import { ServerConn } from './ServerConn';
import { AuthedClient } from '../client-api/AuthedClient';

export class ServerAPI extends API<ServerConn> {
  talkingClients: Map<string, AuthedClient> = new Map();
  playerConns: RelationMap<ClientConnection> = new RelationMap();

  constructor(mgr: APIManager) {
    super(mgr, 'server', ServerConn);

    this.nsp.use(serverAPIAuthenticator);
  }

  setTalkingClient(uuid: string, client: AuthedClient) {
    if (this.talkingClients.has(uuid)) {
      this.unsetTalkingClient(uuid);
    }

    this.nsp.emit('talk', uuid, true);

    this.talkingClients.set(uuid, client);
  }

  unsetTalkingClient(uuid: string) {
    this.nsp.emit('talk', uuid, false);

    this.talkingClients.delete(uuid);

    // Delete cached volumes
    for (const server of this.apiConns) {
      server.playerVols.unset(uuid);
    }

    // Destroy connections
    this.playerConns.forEach(uuid, (playerConn, _, otherUuid) => {
      playerConn.destroy();
      this.playerConns.unset(uuid, otherUuid);
    });
  }

  updateVolume(uuid1: string, uuid2: string) {
    // Get loudest volume (of all servers that have these players connected)
    let volume = 0;
    for (const server of this.apiConns) {
      const serverVolume = server.playerVols.get(uuid1, uuid2);
      if (serverVolume !== undefined && serverVolume > volume) {
        volume = serverVolume;
      }
    }

    // Update player connections
    const playerConn = this.playerConns.get(uuid1, uuid2);
    const client1 = this.talkingClients.get(uuid1);
    const client2 = this.talkingClients.get(uuid2);

    if (volume === 0 || !client1 || !client2) {
      playerConn?.destroy();
      this.playerConns.unset(uuid1, uuid2);
      return;
    }

    if (!playerConn) {
      this.playerConns.set(
        uuid1,
        uuid2,
        new ClientConnection(client1, client2, volume)
      );
    } else {
      playerConn.updateVolume(volume);
    }
  }
}
