import { useSocketOn } from '../../bin/socket';
import { useErrorAlert } from './ErrorAlert';

export const SocketError: React.FC = () => {
  const [addError, removeError] = useErrorAlert({
    index: 0,
    msg: 'Reconnecting...',
    loadingIcon: true,
  });

  useSocketOn('connect_error', addError);
  useSocketOn('connect_failed', addError);
  useSocketOn('reconnect_error', addError);
  useSocketOn('reconnect_failed', addError);

  useSocketOn('connect', removeError);
  useSocketOn('reconnect', removeError);

  return null;
};
