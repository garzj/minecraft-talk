import { APIManager } from '../APIManager';
import { RTCConnection } from '../client-api/RTCConnection';

export class PlayerConnection {
  rtcConn?: RTCConnection;

  constructor(
    private mgr: APIManager,
    public uuid1: string,
    public uuid2: string,
    public volume: number
  ) {
    this.updateConn();
  }

  updateConn() {
    const client1 = this.mgr.clientApi.activeClients[this.uuid1];
    const client2 = this.mgr.clientApi.activeClients[this.uuid2];
    if (!client1 || !client2) {
      this.rtcConn?.destroy();
      delete this.rtcConn;
      return;
    }

    if (!this.rtcConn) {
      this.rtcConn = new RTCConnection(client1, client2, this.volume);
    } else {
      this.rtcConn.updateVolume(this.volume);
    }
  }

  updateVolume(volume: number) {
    this.volume = volume;
    this.updateConn();
  }

  destroy() {
    this.rtcConn?.destroy();
    delete this.rtcConn;
  }
}
