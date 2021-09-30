import { Socket } from 'socket.io';
import { signObj } from '../../bin/sign-obj';
import { APIConn } from '../APIConn';
import { APIManager } from '../APIManager';
import { Token } from '../../bin/Token';
import { PlayerConn } from './PlayerConn';
import { RelationMap } from '../../bin/RelationMap';
import { hasOwnProperty } from '../../bin/helpers';

export class ServerConn extends APIConn {
  playerConns: RelationMap<PlayerConn> = new RelationMap();

  constructor(apiMgr: APIManager, socket: Socket) {
    super(apiMgr, socket);

    this.setupApi();
  }

  private setupApi() {
    this.socket.on(
      'login',
      (uuid: string, name: string, ack: (link: string) => void) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const token: Token = {
          createdAt: new Date().getTime(),
          expiredAt: tomorrow.getTime(),
          name,
          uuid,
        };

        const signedToken = signObj(token);

        const encodedToken = encodeURIComponent(signedToken);
        const link = `${process.env.ORIGIN}login/?token=${encodedToken}`;

        ack(link);
      }
    );

    this.socket.on('logout', (uuid, ack: (success: boolean) => void) => {
      ack(this.apiMgr.clientApi.logoutUser(uuid));
    });

    this.socket.on('update-vols', (uuid1, volumes: { string: number }) => {
      for (let [uuid2, volume] of Object.entries(volumes)) {
        // Store connection
        if (volume === 0) {
          this.playerConns.unset(uuid1, uuid2);
        } else {
          this.playerConns.set(uuid1, uuid2, { uuid1, uuid2, volume });
        }

        // Initiate volume update from the first user's clients
        const clients = this.apiMgr.clientApi.clients;

        if (!hasOwnProperty(clients, uuid1)) continue;
        const user1Clients = Object.values(clients[uuid1]);

        if (!hasOwnProperty(clients, uuid2)) continue;
        const user2Clients = Object.values(clients[uuid2]);

        for (let client1 of user1Clients) {
          for (let client2 of user2Clients) {
            client1.setVolumeTo(client2, volume);
          }
        }
      }
    });

    this.socket.on('disconnect', () => {
      // The server shut down, so disconnect all clients from each other on this server
      for (let client of this.apiMgr.clientApi.clientsAsList()) {
        const connectedUuids = this.playerConns.getKeys(client.token.uuid);
        if (!connectedUuids) continue;

        for (let connectedUuid of connectedUuids) {
          const clients = this.apiMgr.clientApi.clients;
          if (!hasOwnProperty(clients, connectedUuid)) continue;
          const connectedClients = Object.values(clients[connectedUuid]);

          for (let connectedClient of connectedClients) {
            client.disconnectFrom(connectedClient);
          }
        }
      }
    });
  }
}
