import { useErrorAlert } from '@/pages/error/ErrorAlert';
import { PlayerData } from '@shared/types/PlayerData';
import React, {
  useState,
  useContext,
  createContext,
  useCallback,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { clearCookie } from '../bin/cookies';
import { socketEmit, useSocketLoader, useSocketOn } from '../bin/socket';

type Auth = PlayerData | null;

const authContext = createContext<Auth>(null);

interface Props {
  children?: ReactNode;
}

export const ProvideAuth: React.FC<Props> = ({ children }) => {
  const [auth, setAuth] = useState<Auth>(null);
  const navigate = useNavigate();

  // Token expiration
  const onTokenExpired = useCallback(() => {
    clearCookie('token');
    navigate('/expired');
  }, [navigate]);
  useSocketOn('token-expired', onTokenExpired);

  // Forced logout
  const onLogout = useCallback(() => {
    navigate('/logout');
  }, [navigate]);
  useSocketOn('logout', onLogout);

  // Auth data
  useSocketOn(
    'set-player-data',
    useCallback((player: PlayerData) => setAuth(player), [setAuth])
  );
  useSocketLoader(
    useCallback(() => {
      socketEmit('get-player-data');
    }, [])
  );

  // Activeness
  const [, , setActiveErr] = useErrorAlert({
    index: 250,
    msg: 'Another client is currently active.',
    btn: {
      msg: 'Talk here',
      onClick: useCallback(() => socketEmit('activate-client'), []),
    },
  });
  const onActiveChange = useCallback(
    (active: boolean) => setActiveErr(!active),
    [setActiveErr]
  );
  useSocketOn('set-client-active', onActiveChange);

  useSocketLoader(
    useCallback(() => {
      socketEmit('init-client-active');
    }, [])
  );

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
