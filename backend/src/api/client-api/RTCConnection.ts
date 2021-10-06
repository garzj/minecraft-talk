import { RTCConnData } from '@shared/types/rtc';
import { AuthedClient } from './AuthedClient';
import { genTurnUser } from './turn-server';

export class RTCConnection {
  listeners: {
    client: AuthedClient;
    event: string;
    callback: (...args: any[]) => void;
  }[] = [];

  constructor(
    public client1: AuthedClient,
    public client2: AuthedClient,
    public volume: number
  ) {
    this.connect();
  }

  private getRTCConnData(
    client: AuthedClient,
    other: AuthedClient,
    initiator: boolean
  ): RTCConnData {
    return {
      initiator,
      turnUser: genTurnUser(client.token.uuid),
      volume: this.volume,
      to: {
        player: other.getPlayerData(),
        socketId: other.getSocketId(),
      },
    };
  }

  private connect() {
    this.client1.conn.socket.emit(
      'rtc-connect',
      this.getRTCConnData(this.client1, this.client2, true)
    );
    this.client2.conn.socket.emit(
      'rtc-connect',
      this.getRTCConnData(this.client2, this.client1, false)
    );

    this.socketOn(this.client1, 'rtc-desc', (sdp: unknown) =>
      this.client2.conn.socket.emit('rtc-desc', this.client1.getSocketId(), sdp)
    );
    this.socketOn(this.client2, 'rtc-desc', (sdp: unknown) =>
      this.client1.conn.socket.emit('rtc-desc', this.client2.getSocketId(), sdp)
    );

    this.socketOn(this.client1, 'rtc-ice', (ice: unknown) =>
      this.client2.conn.socket.emit('rtc-ice', this.client1.getSocketId(), ice)
    );
    this.socketOn(this.client2, 'rtc-ice', (ice: unknown) =>
      this.client1.conn.socket.emit('rtc-ice', this.client2.getSocketId(), ice)
    );
  }

  updateVolume(volume: number) {
    if (volume === this.volume) return;

    this.client1.conn.socket.emit(
      'rtc-update-vol',
      this.client2.getSocketId(),
      volume
    );
    this.client2.conn.socket.emit(
      'rtc-update-vol',
      this.client1.getSocketId(),
      volume
    );
  }

  private disconnect() {
    if (!this.client1.conn.socket.disconnected) {
      this.client1.conn.socket.emit(
        'rtc-disconnect',
        this.client2.getSocketId()
      );
    }
    if (!this.client2.conn.socket.disconnected) {
      this.client2.conn.socket.emit(
        'rtc-disconnect',
        this.client1.getSocketId()
      );
    }
  }

  private socketOn(
    client: AuthedClient,
    event: string,
    callback: (...args: any[]) => void
  ) {
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
