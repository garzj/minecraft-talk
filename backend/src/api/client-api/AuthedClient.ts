import { Token } from '../../bin/token/Token';
import { ClientConn } from './ClientConn';
import { RTCConnection } from './RTCConnection';
import { APIManager } from '../APIManager';
import { dropTurnUser } from './turn-server';
import { PlayerData } from '@shared/types/PlayerData';

export class AuthedClient {
  emitVErr!: () => void;

  constructor(
    public mgr: APIManager,
    public clientConn: ClientConn,
    public token: Token
  ) {
    this.setupApi();

    this.mgr.serverApi.joinTalk(this.token.uuid);
  }

  getPlayerData(): PlayerData {
    return { uuid: this.token.uuid, name: this.token.name };
  }

  getSocketId() {
    return this.clientConn.socket.id;
  }

  setVolumeTo(other: AuthedClient, volume: number): void {
    const rtcConns = this.mgr.clientApi.rtcConns;

    const rtcConn = rtcConns.get(this.getSocketId(), other.getSocketId());

    if (volume === 0) {
      // Disconnect
      if (!rtcConn) return;

      rtcConns.unset(this.getSocketId(), other.getSocketId());
      return rtcConn.destroy();
    }

    if (rtcConn) {
      rtcConn.updateVolume(volume);
    } else {
      rtcConns.set(
        this.getSocketId(),
        other.getSocketId(),
        new RTCConnection(this, other, volume)
      );
    }
  }

  private setupApi() {
    const socket = this.clientConn.socket;

    // Validation errors
    let message: string;
    socket.use((e, next) => {
      message = e[0];
      next();
    });
    this.emitVErr = () => socket.emit('validation-error', message);

    // API
    socket.on('get-player-data', () => {
      socket.emit('set-player-data', this.getPlayerData());
    });

    this.initVolumes();
  }

  private initVolumes() {
    // Update volumes to all connected clients
    this.mgr.serverApi.playerVols.forEach(
      this.token.uuid,
      (volume, _, otherUuid) => {
        this.mgr.clientApi.authedClients.forEach(otherUuid, (other) => {
          this.setVolumeTo(other, volume);
        });
      }
    );
  }

  logout() {
    // I know, the client could ignore this message,
    // but since i have no database to invalidate tokens
    // (because I'm lazy), there's no better way
    this.clientConn.socket.emit('logout');
  }

  destroy() {
    this.mgr.clientApi.rtcConns.forEach(this.getSocketId(), (rtcConn) =>
      rtcConn.destroy()
    );
    this.mgr.serverApi.leaveTalk(this.token.uuid);

    dropTurnUser(this.token.uuid);
  }
}
