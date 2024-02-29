import { Socket } from 'socket.io';
import { NestedMap } from '../../../shared/map/NestedMap';
import { AudioState } from '../../../shared/types/AudioState';
import { signObj } from '../../bin/sign-obj';
import { Token } from '../../bin/token/Token';
import { APIConn } from '../APIConn';
import { APIManager } from '../APIManager';

export class ServerConn extends APIConn {
  playerVols: NestedMap<AudioState> = new NestedMap();

  constructor(apiMgr: APIManager, socket: Socket) {
    super(apiMgr, socket);

    this.setupApi();
  }

  private updateAudioState(dst: string, src: string, audioState: AudioState | null) {
    if (!this.mgr.serverApi.talkingClients.has(dst)) return;
    if (!this.mgr.serverApi.talkingClients.has(src)) return;

    if (audioState == null) {
      this.playerVols.unset(dst, src);
    } else {
      this.playerVols.set(dst, src, audioState);
    }

    this.mgr.serverApi.updateVolume(dst, src);
  }

  private setupApi() {
    // Emit all talking players upon connection
    for (const uuid of this.mgr.serverApi.talkingClients.keys()) {
      this.socket.emit('talk', uuid, true);
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
    this.socket.on('update-conns', (dst, conns: { [src: string]: AudioState }) => {
      for (const [src, audioState] of Object.entries(conns)) {
        this.updateAudioState(dst, src, audioState);
      }
    });
  }

  onDisconnect() {
    // Disconnect -> clear all audio states
    this.playerVols.forEach((_, dst, src) => {
      this.updateAudioState(dst, src, null);
    });
  }
}
