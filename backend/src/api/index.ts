import * as SocketIO from 'socket.io';
import ServerAPI from './server-api';
import ClientAPI from './client-api';
import server from '../config/server';

const io = new SocketIO.Server(server);

// Minecraft Server API

const serverNsp = io.of('/server-api');
export { serverNsp };

serverNsp.use((socket, next) => {
  if (socket.handshake.auth.cs === process.env.CONVERSATION_SECRET) {
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
