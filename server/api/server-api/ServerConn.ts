import { Socket } from 'socket.io';
import { RelationMap } from '../../../shared/map/RelationMap';
import { signObj } from '../../bin/sign-obj';
import { Token } from '../../bin/token/Token';
import { APIConn } from '../APIConn';
import { APIManager } from '../APIManager';

export class ServerConn extends APIConn {
  playerVols: RelationMap<number> = new RelationMap();

  constructor(apiMgr: APIManager, socket: Socket) {
    super(apiMgr, socket);

    this.setupApi();
  }

  private updateVolume(uuid1: string, uuid2: string, volume: number) {
    if (!this.mgr.serverApi.talkingClients.has(uuid1)) return;
    if (!this.mgr.serverApi.talkingClients.has(uuid2)) return;

    if (volume === 0) {
      this.playerVols.unset(uuid1, uuid2);
    } else {
      this.playerVols.set(uuid1, uuid2, volume);
    }

    this.mgr.serverApi.updateVolume(uuid1, uuid2);
  }

  private setupApi() {
    // Emit all talking players upon connection
    for (const [uuid, count] of Object.entries(this.mgr.serverApi.talkingClients)) {
      if (count > 0) {
        this.socket.emit('talk', uuid, true);
      }
    }

    // Login / Logout:
    this.socket.on('login', (uuid: string, name: string, ack: (link: string) => void) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const token: Token = {
        createdAt: new Date().getTime(),
        expiredAt: tomorrow.getTime(),
        name,
        uuid,
      };

      const signedToken = signObj(token);

      const encodedToken = encodeURIComponent(Buffer.from(signedToken).toString('base64'));
      const link = `${process.env.ORIGIN}login/?t=${encodedToken}`;

      ack(link);
    });

    this.socket.on('logout', (uuid, ack: (success: boolean) => void) => {
      ack(this.mgr.clientApi.logoutPlayer(uuid));
    });

    // Volume updates
    this.socket.on('update-vols', (uuid1, volumes: { [uuid: string]: number }) => {
      for (const [uuid2, volume] of Object.entries(volumes)) {
        this.updateVolume(uuid1, uuid2, volume);
      }
    });
  }

  onDisconnect() {
    // Disconnect -> set all volumes to 0
    this.playerVols.forEach((_, uuid1, uuid2) => {
      this.updateVolume(uuid1, uuid2, 0);
    });
  }
}
