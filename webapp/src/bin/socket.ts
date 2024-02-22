import { useEffect } from 'react';
import socketIOClient from 'socket.io-client';

const socket = socketIOClient('/api/client');

if (process.env.NODE_ENV === 'development') {
  socket.on('validation-error', (msg: string, err: string) => {
    console.warn(`Socket -> Validation error on message ${msg}: ${err}`);
  });
}

export const useSocketOn = (event: string, handler: (...args: any[]) => void) =>
  useEffect(() => {
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [handler]);

export const useSocketLoader = (loader: () => (() => void) | void) => {
  useEffect(() => {
    let onUnload: (() => void) | null = null;

    const handleLoad = () => {
      const _onUnload = loader();
      onUnload = typeof _onUnload === 'function' ? _onUnload : null;
    };
    const handleUnload = () => {
      onUnload?.();
      onUnload = null;
    };

    handleLoad();
    socket.on('disconnect', handleUnload);
    socket.on('reconnect', handleLoad);

    return () => {
      socket.off('disconnect', handleUnload);
      socket.off('reconnect', handleLoad);

      handleUnload();
    };
  }, [loader]);
};

export const socketEmit = (event: string, ...args: any[]) =>
  socket.emit(event, ...args);
