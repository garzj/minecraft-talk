import { PlayerData } from '../../bin/PlayerData';
import { hasOwnProperty } from '../../bin/helpers';
import { Token } from '../../bin/Token';
import { ClientConn } from './ClientConn';
// import { RTCConnector } from './RTCConnector';

export class AuthedClient {
  clientConn: ClientConn;
  token: Token;

  conns: { [uuid: string]: Set<string> } = {};

  vErr: () => void;

  constructor(clientConn: ClientConn, token: Token) {
    this.clientConn = clientConn;
    this.token = token;

    // API validation errors
    let message: string;
    this.clientConn.socket.use((e, next) => {
      message = e[0];
      next();
    });
    this.vErr = () => this.clientConn.socket.emit('validation-error', message);

    this.setupApi();

    // Directly connect players opening the website
    this.initConnections();
  }

  getPlayerData(): PlayerData {
    return { uuid: this.token.uuid, name: this.token.name };
  }

  getId() {
    return this.clientConn.socket.id;
  }

  setVolumeTo(other: AuthedClient, volume: number): void {
    const alreadyConnected =
      hasOwnProperty(this.conns, other.token.uuid) &&
      this.conns[other.token.uuid].has(other.getId());

    if (volume === 0) {
      // Disconnect
      if (!alreadyConnected) return;

      this.disconnectFrom(other);
      other.disconnectFrom(this);
      return;
    }

    if (alreadyConnected) {
      // Update volumes
      this.clientConn.socket.emit('update-vol', other.token.uuid, volume);
      other.clientConn.socket.emit('update-vol', this.token.uuid, volume);
    } else {
      // TODO: Connect clients
      if (!hasOwnProperty(this.conns, other.token.uuid)) {
        this.conns[other.token.uuid] = new Set();
      }
      this.conns[other.token.uuid].add(other.getId());

      // new RTCConnector(this, other, volume);
    }
  }

  disconnectFrom(other: AuthedClient) {
    if (!hasOwnProperty(this.conns, other.token.uuid)) return;
    const connIds = this.conns[other.token.uuid];
    if (!connIds.has(other.getId())) return;

    // TODO: Close conenction
    // this.clientConn.socket.emit('rtc-close', other.token.uuid, other.getId());

    connIds.delete(other.getId());
    if (connIds.size === 0) {
      delete this.conns[other.token.uuid];
    }
  }

  logout() {
    this.clientConn.socket.emit('logout');
    this.clientConn.unauth();
  }

  private setupApi() {
    const socket = this.clientConn.socket;

    socket.on('get-player-data', (ack: (player: PlayerData) => void) => {
      if (typeof ack !== 'function') return this.vErr();

      ack(this.getPlayerData());
    });

    socket.on('logout', () => {
      this.clientConn.apiMgr.clientApi.logoutUser(this.token.uuid);
    });
  }

  private initConnections() {
    for (let serverConn of this.clientConn.apiMgr.serverApi.conns) {
      const playerConns = serverConn.playerConns;

      const connectedUuids = playerConns.getKeys(this.token.uuid);
      if (!connectedUuids) continue;

      for (let connectedUuid of connectedUuids) {
        const playerConn = playerConns.get(this.token.uuid, connectedUuid);
        if (!playerConn) continue;

        const clients = this.clientConn.apiMgr.clientApi.clients;
        if (!hasOwnProperty(clients, connectedUuid)) continue;

        const connectedClients = Object.values(clients[connectedUuid]);
        for (let connectedClient of connectedClients) {
          this.setVolumeTo(connectedClient, playerConn.volume);
        }
      }
    }
  }
}
