import { RelationMap } from '../../../shared/map/RelationMap';
import { API } from '../API';
import { APIManager } from '../APIManager';
import { AuthedClient } from '../client-api/AuthedClient';
import { ClientConnection } from '../client-api/ClientConnection';
import { ServerConn } from './ServerConn';
import { serverAPIAuthenticator } from './authenticator';

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

  updateVolume(dst: string, src: string) {
    // Get loudest volume (of all servers that have these players connected)
    let volume = 0;
    for (const server of this.apiConns) {
      const serverVolume = server.playerVols.get(dst, src);
      if (serverVolume !== undefined && serverVolume > volume) {
        volume = serverVolume;
      }
    }

    // Update player connections
    const playerConn = this.playerConns.get(dst, src);
    const dstClient = this.talkingClients.get(dst);
    const srcClient = this.talkingClients.get(src);

    const allZero =
      volume === 0 &&
      (!playerConn ||
        (playerConn.client1.getPlayerData().uuid === dst ? playerConn.dstVolume2 : playerConn.dstVolume1) === 0);
    if (!dstClient || !srcClient || allZero) {
      playerConn?.destroy();
      this.playerConns.unset(dst, src);
      return;
    }

    if (!playerConn) {
      this.playerConns.set(dst, src, new ClientConnection(dstClient, srcClient, volume, 0));
    } else {
      playerConn.updateVolume(dstClient, volume);
    }
  }
}
