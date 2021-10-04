import { useEffect } from 'react';
import { socket } from '../../bin/socket';
import { useErrorAlert } from './ErrorAlerts';

export const SocketError: React.FC = () => {
  const [addError, removeError] = useErrorAlert('socket', 'Reconnecting...');

  useEffect(() => {
    socket.on('connect_error', addError);
    socket.on('connect_failed', addError);
    socket.on('reconnect_error', addError);
    socket.on('reconnect_failed', addError);

    socket.on('connect', removeError);
    socket.on('reconnect', removeError);
  }, [addError, removeError]);

  return null;
};
