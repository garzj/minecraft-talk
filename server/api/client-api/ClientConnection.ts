import { RTCConnData } from '../../../shared/types/rtc';
import { AuthedClient } from './AuthedClient';
import { genTurnUser } from './turn-server';

export class ClientConnection {
  listeners: {
    client: AuthedClient;
    event: string;
    callback: (...args: any[]) => void;
  }[] = [];

  constructor(
    public client1: AuthedClient,
    public client2: AuthedClient,
    public volume: number,
  ) {
    this.connect();
  }

  private getRTCConnData(from: AuthedClient, to: AuthedClient, initiator: boolean): RTCConnData {
    return {
      initiator,
      turnUser: genTurnUser(from.token.uuid),
      volume: this.volume,
      to: {
        player: to.getPlayerData(),
        socketId: to.getSocketId(),
      },
    };
  }

  private connect() {
    this.client1.conn.socket.emit('rtc-connect', this.getRTCConnData(this.client1, this.client2, true));
    this.client2.conn.socket.emit('rtc-connect', this.getRTCConnData(this.client2, this.client1, false));

    // Reemit messages between clients
    for (const event of ['rtc-desc', 'rtc-ice', 'rtc-err']) {
      this.socketOn(this.client1, event, (...args: unknown[]) =>
        this.client2.conn.socket.emit(event, this.client1.getSocketId(), ...args),
      );
      this.socketOn(this.client2, event, (...args: unknown[]) =>
        this.client1.conn.socket.emit(event, this.client2.getSocketId(), ...args),
      );
    }
  }

  updateVolume(volume: number) {
    if (volume === this.volume) return;
    this.volume = volume;

    this.client1.conn.socket.emit('rtc-update-vol', this.client2.getSocketId(), volume);
    this.client2.conn.socket.emit('rtc-update-vol', this.client1.getSocketId(), volume);
  }

  private disconnect() {
    this.client1.conn.socket.emit('rtc-disconnect', this.client2.getSocketId());
    this.client2.conn.socket.emit('rtc-disconnect', this.client1.getSocketId());
  }

  private socketOn(client: AuthedClient, event: string, callback: (...args: any[]) => void) {
    this.listeners.push({ client, event, callback });
    client.conn.socket.on(event, callback);
  }

  destroy() {
    for (const listener of this.listeners) {
      listener.client.conn.socket.off(listener.event, listener.callback);
    }

    this.disconnect();
  }
}
