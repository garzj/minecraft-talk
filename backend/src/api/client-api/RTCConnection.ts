import { RTCSetupData } from '@shared/types/rtc';
import { AuthedClient } from './AuthedClient';
import { genTurnUser } from './turn-server';

export class RTCConnection {
  constructor(
    public client1: AuthedClient,
    public client2: AuthedClient,
    public volume: number
  ) {
    this.getOffer();
  }

  destroy() {
    if (!this.client1.conn.socket.disconnected) {
      this.client1.conn.socket.emit('rtc-close', this.client2.getSocketId());
    }
    if (!this.client2.conn.socket.disconnected) {
      this.client2.conn.socket.emit('rtc-close', this.client1.getSocketId());
    }
  }

  updateVolume(volume: number) {
    this.client1.conn.socket.emit(
      'rtc-update-vol',
      this.client1.getSocketId(),
      volume
    );
    this.client2.conn.socket.emit(
      'rtc-update-vol',
      this.client2.getSocketId(),
      volume
    );
  }

  private getOffer() {
    const rtcSetupData: RTCSetupData = {
      turnUser: genTurnUser(this.client1.token.uuid),
      volume: this.volume,
      to: {
        playerData: this.client2.getPlayerData(),
        socketId: this.client2.getSocketId(),
      },
    };

    this.client1.conn.socket.emit('rtc-create-offer', rtcSetupData);

    this.client1.conn.socket.on('rtc-offer', (offer: string) => {
      if (typeof offer !== 'string') return this.client1.emitVErr();

      this.getAnswer(offer);
    });
  }

  private getAnswer(offer: string) {
    const rtcSetupData: RTCSetupData = {
      turnUser: genTurnUser(this.client2.token.uuid),
      volume: this.volume,
      to: {
        playerData: this.client1.getPlayerData(),
        socketId: this.client1.getSocketId(),
      },
    };

    this.client2.conn.socket.emit('rtc-create-answer', rtcSetupData, offer);

    this.client2.conn.socket.on('rtc-answer', (answer: string) => {
      if (typeof answer !== 'string') return this.client2.emitVErr();

      this.setAnswer(answer);
    });
  }

  private setAnswer(answer: string) {
    this.client1.conn.socket.emit(
      'rtc-apply-answer',
      this.client2.getSocketId(),
      answer
    );
  }
}
