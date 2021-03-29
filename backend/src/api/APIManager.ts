import * as Http from 'http';
import * as SocketIO from 'socket.io';
import { PlayerConnections } from '../bin/PlayerConnections';
import { API } from './API';
import { APIName } from './APIName';
import { ClientAPI } from './client-api/ClientAPI';
import { ServerAPI } from './server-api/ServerAPI';

export class APIManager {
  io: SocketIO.Server;
  apis: Record<APIName, API>;

  playerConns: PlayerConnections = {};

  constructor(server: Http.Server) {
    this.io = new SocketIO.Server(server);

    this.apis = {
      server: new ServerAPI(this),
      client: new ClientAPI(this),
    };
  }
}
