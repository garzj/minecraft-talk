import * as Http from 'http';
import * as SocketIO from 'socket.io';
import { PlayerConnections } from '../bin/PlayerConnections';
import { ClientAPI } from './client-api/ClientAPI';
import { ServerAPI } from './server-api/ServerAPI';

export class APIManager {
  io: SocketIO.Server;
  clientApi: ClientAPI;
  serverApi: ServerAPI;

  playerConns: PlayerConnections = {};

  constructor(server: Http.Server) {
    this.io = new SocketIO.Server(server);

    this.clientApi = new ClientAPI(this);
    this.serverApi = new ServerAPI(this);
  }
}
