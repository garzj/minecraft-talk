import { useEffect } from 'react';
import socketIOClient from 'socket.io-client';

export const socket = socketIOClient('/api/client', {});

if (process.env.NODE_ENV === 'development') {
  socket.on('validation-error', (msg: string, err: string) => {
    console.warn(`Socket -> Validation error on message ${msg}: ${err}`);
  });
}

export const useSubSocket = (
  event: string,
  handler: (...args: any[]) => void
) =>
  useEffect(() => {
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  });
