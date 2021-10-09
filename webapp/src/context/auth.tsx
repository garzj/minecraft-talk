import { useErrorAlert } from '@/public/error/ErrorAlert';
import { PlayerData } from '@shared/types/PlayerData';
import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from 'react';
import { useHistory } from 'react-router-dom';
import { clearCookie } from '../bin/cookies';
import { socket, useSubSocket } from '../bin/socket';

type Auth = PlayerData | null;

const authContext = createContext<Auth>(null);

export const ProvideAuth: React.FC = ({ children }) => {
  const [auth, setAuth] = useState<Auth>(null);
  const history = useHistory();

  // Token expiration
  const onTokenExpired = useCallback(() => {
    clearCookie('token');
    history.push('/expired');
  }, [history]);
  useSubSocket('token-expired', onTokenExpired);

  // Forced logout
  const onLogout = useCallback(() => {
    history.push('/logout');
  }, [history]);
  useSubSocket('logout', onLogout);

  // Auth data
  useSubSocket(
    'set-player-data',
    useCallback((player: PlayerData) => setAuth(player), [setAuth])
  );
  useEffect(() => {
    socket.emit('get-player-data');
  }, []);

  // Activeness
  const [, , setActiveErr] = useErrorAlert({
    index: 250,
    msg: 'Another client is currently active.',
    btn: {
      msg: 'Talk here',
      onClick: useCallback(() => socket.emit('activate-client'), []),
    },
  });
  const onActiveChange = useCallback(
    (active: boolean) => setActiveErr(!active),
    [setActiveErr]
  );
  useSubSocket('set-client-active', onActiveChange);

  useEffect(() => {
    socket.emit('init-client-active');
  }, []);

  return (
    <authContext.Provider value={auth}>{auth && children}</authContext.Provider>
  );
};

export const useAuth = () => {
  const auth = useContext(authContext);
  if (!auth) {
    throw new Error('useAuth can only be called inside ProvideAuth');
  }
  return auth;
};
