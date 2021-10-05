import { Token } from '../../bin/token/Token';
import { ClientConn } from './ClientConn';
import { APIManager } from '../APIManager';
import { PlayerData } from '@shared/types/PlayerData';
import { hasOwnProperty } from '@shared/util';

export class AuthedClient {
  emitVErr!: () => void;

  constructor(
    public mgr: APIManager,
    public conn: ClientConn,
    public token: Token
  ) {
    this.setupApi();

    this.mgr.serverApi.addTalkingPlayer(this.token.uuid);
  }

  getPlayerData(): PlayerData {
    return { uuid: this.token.uuid, name: this.token.name };
  }

  getSocketId() {
    return this.conn.socket.id;
  }

  private setupApi() {
    const socket = this.conn.socket;

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

    socket.on('get-client-active', () => {
      this.setActive(
        this.isActive() ||
          !hasOwnProperty(this.mgr.clientApi.activeClients, this.token.uuid)
      );
    });

    socket.on('activate-client', () => this.isActive() || this.setActive(true));
  }

  private isActive() {
    return this.mgr.clientApi.activeClients[this.token.uuid] === this;
  }

  private setActive(active: boolean) {
    if (!active) {
      if (this.isActive()) {
        delete this.mgr.clientApi.activeClients[this.token.uuid];
      }

      this.conn.socket.emit('set-client-active', false);
    } else {
      const clientApi = this.mgr.clientApi;
      if (hasOwnProperty(clientApi.activeClients, this.token.uuid)) {
        clientApi.activeClients[this.token.uuid].setActive(false);
      }
      clientApi.activeClients[this.token.uuid] = this;

      this.conn.socket.emit('set-client-active', true);
    }

    this.mgr.serverApi.playerConns.forEach(this.token.uuid, (playerConn) => {
      playerConn.updateConn();
    });
  }

  logout() {
    // I know, the client could ignore this message,
    // but since i have no database to invalidate tokens
    // (because I'm lazy), there's no better way
    this.conn.socket.emit('logout');
  }

  destroy() {
    this.setActive(false);

    this.mgr.serverApi.removeTalkingPlayer(this.token.uuid);
  }
}
