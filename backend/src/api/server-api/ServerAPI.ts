import { RelationMap } from '../../bin/two-key-map/RelationMap';
import { hasOwnProperty } from '../../bin/util';
import { API } from '../API';
import { APIManager } from '../APIManager';
import { serverAPIAuthenticator } from './authenticator';
import { ServerConn } from './ServerConn';

export class ServerAPI extends API<ServerConn> {
  talkingPlayers: { [uuid: string]: number } = {};
  playerVols: RelationMap<number> = new RelationMap();

  constructor(mgr: APIManager) {
    super(mgr, 'server', ServerConn);

    this.nsp.use(serverAPIAuthenticator);
  }

  public joinTalk(uuid: string) {
    if (!hasOwnProperty(this.talkingPlayers, uuid)) {
      this.talkingPlayers[uuid] = 1;

      this.nsp.emit('talk', uuid, true);
    } else {
      this.talkingPlayers[uuid]++;
    }
  }

  updateVolume(uuid1: string, uuid2: string) {
    // Use loudest volume (of all servers that have these players connected)
    let volume = 0;
    for (let server of this.apiConns) {
      const serverVolume = server.playerVols.get(uuid1, uuid2);
      if (serverVolume !== undefined && serverVolume > volume) {
        volume = serverVolume;
      }
    }
    this.playerVols.set(uuid1, uuid2, volume);

    // Update volume from every uuid1's client to every uuid2's client
    const authedClients = this.mgr.clientApi.authedClients;
    authedClients.forEach(uuid1, (client1) => {
      authedClients.forEach(uuid2, (client2) => {
        client1.setVolumeTo(client2, volume);
      });
    });
  }

  public leaveTalk(uuid: string) {
    this.talkingPlayers[uuid]--;

    if (this.talkingPlayers[uuid] === 0) {
      delete this.talkingPlayers[uuid];

      this.nsp.emit('talk', uuid, false);
    }
  }
}
