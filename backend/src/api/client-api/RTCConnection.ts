import { RTCSetupData } from '@shared/types/rtc';
import { AuthedClient } from './AuthedClient';
import { genTurnUser } from './turn-server';

export class RTCConnection {
  constructor(
    public client: AuthedClient,
    public other: AuthedClient,
    public volume: number
  ) {
    this.getOffer();
  }

  destroy() {
    if (!this.client.clientConn.socket.disconnected) {
      this.client.clientConn.socket.emit('rtc-close', this.other.getSocketId());
    }
    if (!this.other.clientConn.socket.disconnected) {
      this.other.clientConn.socket.emit('rtc-close', this.client.getSocketId());
    }
  }

  updateVolume(volume: number) {
    this.client.clientConn.socket.emit(
      'update-vol',
      this.client.getSocketId(),
      volume
    );
    this.other.clientConn.socket.emit(
      'update-vol',
      this.other.getSocketId(),
      volume
    );
  }

  private getOffer() {
    const rtcSetupData: RTCSetupData = {
      turnUser: genTurnUser(this.client.token.uuid),
      playerData: this.client.getPlayerData(),
      volume: this.volume,
      to: {
        playerData: this.other.getPlayerData(),
        socketId: this.other.getSocketId(),
      },
    };

    this.client.clientConn.socket.emit(
      'rtc-create-offer',
      rtcSetupData,
      (offer: string) => {
        if (typeof offer !== 'string') return this.client.emitVErr();

        this.getAnswer(offer);
      }
    );
  }

  private getAnswer(offer: string) {
    const rtcSetupData: RTCSetupData = {
      turnUser: genTurnUser(this.other.token.uuid),
      playerData: this.other.getPlayerData(),
      volume: this.volume,
      to: {
        playerData: this.client.getPlayerData(),
        socketId: this.client.getSocketId(),
      },
    };

    this.other.clientConn.socket.emit(
      'rtc-create-answer',
      rtcSetupData,
      offer,
      (answer: string) => {
        if (typeof answer !== 'string') return this.other.emitVErr();

        this.setAnswer(answer);
      }
    );
  }

  private setAnswer(answer: string) {
    this.client.clientConn.socket.emit(
      'rtc-apply-answer',
      this.other.getSocketId(),
      answer
    );
  }
}
