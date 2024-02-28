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
    public dstVolume1: number,
    public dstVolume2: number,
  ) {
    this.connect();
  }

  private getRTCConnData(from: AuthedClient, to: AuthedClient, initiator: boolean): RTCConnData {
    return {
      initiator,
      turnUser: genTurnUser(from.token.uuid),
      volume: from === this.client1 ? this.dstVolume1 : this.dstVolume2,
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
      this.socketOn(this.client1, event, (socketId: unknown, ...args: unknown[]) => {
        if (socketId !== this.client2.getSocketId()) return;
        this.client2.conn.socket.emit(event, this.client1.getSocketId(), ...args);
      });
      this.socketOn(this.client2, event, (socketId: unknown, ...args: unknown[]) => {
        if (socketId !== this.client1.getSocketId()) return;
        this.client1.conn.socket.emit(event, this.client2.getSocketId(), ...args);
      });
    }
  }

  updateVolume(client: AuthedClient, volume: number) {
    if (![this.client1, this.client2].includes(client)) {
      return console.error(
        `Failed to update volume of client ${client.getSocketId()}. ` +
          `Only ${this.client1.getSocketId()} and ${this.client2.getSocketId()} ` +
          `are in this connection.`,
      );
    }

    const isClient1 = client === this.client1;
    if (volume === (isClient1 ? this.dstVolume1 : this.dstVolume2)) return;
    if (isClient1) {
      this.dstVolume1 = volume;
    } else {
      this.dstVolume2 = volume;
    }
    this.emitVolumeUpdate(client);
  }

  emitVolumeUpdate(client: AuthedClient) {
    const otherClient = client === this.client1 ? this.client2 : this.client1;
    client.conn.socket.emit(
      'rtc-update-vol',
      otherClient.getSocketId(),
      client === this.client1 ? this.dstVolume1 : this.dstVolume2,
    );
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
