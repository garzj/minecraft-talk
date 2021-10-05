import { RelationMap } from '@shared/map/RelationMap';
import { hasOwnProperty } from '@shared/util';
import { API } from '../API';
import { APIManager } from '../APIManager';
import { dropTurnUser } from '../client-api/turn-server';
import { serverAPIAuthenticator } from './authenticator';
import { PlayerConnection } from './PlayerConnection';
import { ServerConn } from './ServerConn';

export class ServerAPI extends API<ServerConn> {
  talkingPlayers: { [uuid: string]: number } = {};
  playerConns: RelationMap<PlayerConnection> = new RelationMap();

  constructor(mgr: APIManager) {
    super(mgr, 'server', ServerConn);

    this.nsp.use(serverAPIAuthenticator);
  }

  addTalkingPlayer(uuid: string) {
    if (!hasOwnProperty(this.talkingPlayers, uuid)) {
      this.talkingPlayers[uuid] = 1;

      this.nsp.emit('talk', uuid, true);
    } else {
      this.talkingPlayers[uuid]++;
    }
  }

  updateVolume(uuid1: string, uuid2: string) {
    // Get loudest volume (of all servers that have these players connected)
    let volume = 0;
    for (let server of this.apiConns) {
      const serverVolume = server.playerVols.get(uuid1, uuid2);
      if (serverVolume !== undefined && serverVolume > volume) {
        volume = serverVolume;
      }
    }

    // Update player connections
    const playerConn = this.playerConns.get(uuid1, uuid2);
    if (volume === 0) {
      playerConn?.destroy();
      this.playerConns.unset(uuid1, uuid2);
      return;
    }

    if (!playerConn) {
      this.playerConns.set(
        uuid1,
        uuid2,
        new PlayerConnection(this.mgr, uuid1, uuid2, volume)
      );
    } else {
      playerConn.updateVolume(volume);
    }
  }

  removeTalkingPlayer(uuid: string) {
    this.talkingPlayers[uuid]--;

    if (this.talkingPlayers[uuid] === 0) {
      this.nsp.emit('talk', uuid, false);

      delete this.talkingPlayers[uuid];

      this.playerConns.forEach(uuid, (playerConn, _, otherUuid) => {
        playerConn.destroy();
        this.playerConns.unset(uuid, otherUuid);
      });

      dropTurnUser(uuid);
    }
  }
}
