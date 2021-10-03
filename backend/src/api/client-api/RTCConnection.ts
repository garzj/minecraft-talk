import { AuthedClient } from './AuthedClient';

// TODO: TURN server

export class RTCConnection {
  constructor(
    public client: AuthedClient,
    public other: AuthedClient,
    public volume: number
  ) {
    this.getOffer();
  }

  destroy() {
    // !DEBUG
    console.log(
      `Destroying connection: ${this.client.getSocketId()} & ${this.other.getSocketId()}`
    );

    if (!this.client.clientConn.socket.disconnected) {
      this.client.clientConn.socket.emit('rtc-close', this.other.getSocketId());
    }
    if (!this.other.clientConn.socket.disconnected) {
      this.other.clientConn.socket.emit('rtc-close', this.client.getSocketId());
    }
  }

  updateVolume(volume: number) {
    // !DEBUG
    console.log(
      `Volume update: ${this.client.getSocketId()} & ${this.other.getSocketId()}: ${volume}`
    );

    this.client.clientConn.socket.emit(
      'update-vol',
      this.client.token.uuid,
      volume
    );
    this.other.clientConn.socket.emit(
      'update-vol',
      this.other.token.uuid,
      volume
    );
  }

  private getOffer() {
    // !DEBUG
    console.log(
      `New connection: ${this.client.getSocketId()} & ${this.other.getSocketId()}`
    );

    this.client.clientConn.socket.emit(
      'rtc-get-offer',
      this.other.getPlayerData(),
      this.other.getSocketId(),
      this.volume,
      (offer: string) => {
        if (typeof offer !== 'string') return this.client.emitVErr();

        this.getAnswer(offer);
      }
    );
  }

  private getAnswer(offer: string) {
    this.other.clientConn.socket.emit(
      'rtc-get-answer',
      this.client.getPlayerData(),
      this.client.getSocketId(),
      this.volume,
      offer,
      (answer: string) => {
        if (typeof answer !== 'string') return this.other.emitVErr();

        this.setAnswer(answer);
      }
    );
  }

  private setAnswer(answer: string) {
    this.client.clientConn.socket.emit(
      'rtc-set-answer',
      this.other.token.uuid,
      this.other.getSocketId(),
      answer
    );
  }
}
