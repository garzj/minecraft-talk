import { RelationMap } from '../../../shared/map/RelationMap';
import { AudioState } from '../../../shared/types/AudioState';
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

  private getMergedAudioState(dst: string, src: string): AudioState | null {
    // Get loudest volume and merge origins (of all servers that have these players connected)
    let count = 0;

    let volume = 0;

    let originCount = 0;
    let originSum: [number, number, number] = [0, 0, 0];

    for (const server of this.apiConns) {
      const audioData = server.playerVols.get(dst, src);
      if (!audioData) continue;

      count++;

      if (audioData.volume > volume) {
        volume = audioData.volume;
      }

      if (audioData.volume != 0 && audioData.origin) {
        originCount++;
        const connOrigin = audioData.origin;
        originSum = originSum.map((v, i) => v + connOrigin[i] * audioData.volume) as [number, number, number];
      }
    }

    if (count == 0) return null;

    let origin: AudioState['origin'] = undefined;
    if (originCount > 0) {
      // normalize
      const mag = Math.sqrt(originSum[0] ** 2 + originSum[1] ** 2 + originSum[2] ** 2);
      origin = originSum.map((v) => v / mag) as [number, number, number];
    }

    return {
      volume,
      origin,
    };
  }

  updateVolume(dst: string, src: string) {
    const audioState = this.getMergedAudioState(dst, src);

    // Update player connections
    const playerConn = this.playerConns.get(dst, src);
    const dstClient = this.talkingClients.get(dst);
    const srcClient = this.talkingClients.get(src);

    const allNull =
      audioState === null &&
      (!playerConn ||
        (playerConn.client1.getPlayerData().uuid === dst ? playerConn.dstState2 : playerConn.dstState1) === null);
    if (!dstClient || !srcClient || allNull) {
      playerConn?.destroy();
      this.playerConns.unset(dst, src);
      return;
    }

    if (!playerConn) {
      this.playerConns.set(dst, src, new ClientConnection(dstClient, srcClient, audioState, null));
    } else {
      playerConn.updateAudioState(dstClient, audioState);
    }
  }
}
