import { Socket } from 'socket.io';

export const serverAPIAuthenticator = (socket: Socket, next: Function) => {
  if (socket.handshake.auth.cs === process.env.CONVERSATION_SECRET) {
    next();
  } else {
    next(new Error('Authentication failed!'));
  }
};
