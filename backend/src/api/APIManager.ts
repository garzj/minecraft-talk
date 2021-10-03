import * as Http from 'http';
import * as SocketIO from 'socket.io';
import { ClientAPI } from './client-api/ClientAPI';
import { ServerAPI } from './server-api/ServerAPI';

export class APIManager {
  io: SocketIO.Server;

  serverApi: ServerAPI;
  clientApi: ClientAPI;

  constructor(server: Http.Server) {
    this.io = new SocketIO.Server(server);

    this.serverApi = new ServerAPI(this);
    this.clientApi = new ClientAPI(this);
  }
}
