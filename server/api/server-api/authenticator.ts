import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';

export const serverAPIAuthenticator = (socket: Socket, next: (err?: ExtendedError) => void) => {
  if (socket.handshake.auth.cs === process.env.CONVERSATION_SECRET) {
    next();
  } else {
    next(new Error('Authentication failed!'));
  }
};
