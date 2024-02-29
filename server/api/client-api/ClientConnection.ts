import { AudioState, defaultAudioState } from '../../../shared/types/AudioState';
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
    public dstState1: AudioState | null,
    public dstState2: AudioState | null,
  ) {
    this.connect();
  }

  private getRTCConnData(from: AuthedClient, to: AuthedClient, polite: boolean): RTCConnData {
    return {
      polite,
      turnUser: genTurnUser(from.token.uuid),
      audioState: (from === this.client1 ? this.dstState1 : this.dstState2) ?? defaultAudioState(),
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

  private ensureClient(client: AuthedClient): boolean {
    if (![this.client1, this.client2].includes(client)) {
      console.error(
        `Failed to update audio state of client ${client.getSocketId()}. ` +
          `Only ${this.client1.getSocketId()} and ${this.client2.getSocketId()} ` +
          `are in this connection.`,
      );
      return false;
    }
    return true;
  }

  updateAudioState(client: AuthedClient, audioState: AudioState | null) {
    if (!this.ensureClient(client)) return;
    if (client === this.client1) {
      this.dstState1 = audioState;
    } else {
      this.dstState2 = audioState;
    }
    this.emitAudioStateUpdate(client);
  }

  emitAudioStateUpdate(client: AuthedClient) {
    if (!this.ensureClient(client)) return;
    const otherClient = client === this.client1 ? this.client2 : this.client1;
    client.conn.socket.emit(
      'rtc-update-audio',
      otherClient.getSocketId(),
      (client === this.client1 ? this.dstState1 : this.dstState2) ?? defaultAudioState(),
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
