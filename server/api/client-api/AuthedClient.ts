import { PlayerData } from '../../../shared/types/PlayerData';
import { Token } from '../../bin/token/Token';
import { APIManager } from '../APIManager';
import { ClientConn } from './ClientConn';
import { dropTurnUser } from './turn-server';

export class AuthedClient {
  talkInitialized = false;

  emitVErr!: () => void;

  constructor(
    public mgr: APIManager,
    public conn: ClientConn,
    public token: Token,
  ) {
    this.setupApi();
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

    // Player data
    socket.on('get-player-data', () => {
      socket.emit('set-player-data', this.getPlayerData());
    });

    // Activeness
    socket.on('init-client-active', () => this.setActive(!this.mgr.clientApi.activeClients.has(this.token.uuid)));

    socket.on('activate-client', () => !this.isActive() && this.setActive(true));

    // Talk
    socket.on('init-talk', () => {
      this.talkInitialized = true;

      this.updateTalking();
    });
  }

  private isActive() {
    return this.mgr.clientApi.activeClients.get(this.token.uuid) === this;
  }

  private setActive(active: boolean) {
    const activeClients = this.mgr.clientApi.activeClients;

    if (active) {
      if (!this.isActive()) {
        activeClients.get(this.token.uuid)?.setActive(false);

        activeClients.set(this.token.uuid, this);

        this.conn.socket.emit('set-client-active', true);
      }
    } else {
      if (this.isActive()) {
        activeClients.delete(this.token.uuid);

        // Set another one active
        this.mgr.clientApi.authedClients
          .getValues(this.token.uuid)
          .filter((c) => c !== this)[0]
          ?.setActive(true);
      }

      this.conn.socket.emit('set-client-active', false);
    }

    this.updateTalking();
  }

  private isTalking() {
    return this.mgr.serverApi.talkingClients.get(this.token.uuid) === this;
  }

  private updateTalking() {
    if (this.talkInitialized && this.isActive()) {
      this.mgr.serverApi.setTalkingClient(this.token.uuid, this);
    } else if (this.isTalking()) {
      this.mgr.serverApi.unsetTalkingClient(this.token.uuid);

      dropTurnUser(this.token.uuid);
    }
  }

  logout() {
    // I know, the client could ignore this message,
    // but since i have no database to invalidate tokens
    // (because I'm lazy), there's no better way
    this.conn.socket.emit('logout');
  }

  destroy() {
    this.setActive(false);
  }
}
