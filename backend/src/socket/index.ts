import server from '../server';
import * as SocketIO from 'socket.io';
import config from '../config';
import ServerAPI from './server-api';
import ClientAPI from './client-api';

const io = new SocketIO.Server(server);

// Minecraft Server API

const serverNsp = io.of('/server-api');
export { serverNsp };

serverNsp.use((socket, next) => {
  if (socket.handshake.auth.cs === config.conversationSecret) {
    next();
  } else {
    socket.emit('err', 'Authorization failed!');
  }
});

serverNsp.on('connection', ServerAPI);

// Web App API

const clientNsp = io.of('/client-api');
export { clientNsp };

clientNsp.on('connection', ClientAPI);
