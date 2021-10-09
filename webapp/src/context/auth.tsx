import { useErrorAlert } from '@/public/error/ErrorAlert';
import { PlayerData } from '@shared/types/PlayerData';
import React, { useState, useContext, createContext, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { clearCookie } from '../bin/cookies';
import { socketEmit, useSocketLoader, useSocketOn } from '../bin/socket';

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
  useSocketOn('token-expired', onTokenExpired);

  // Forced logout
  const onLogout = useCallback(() => {
    history.push('/logout');
  }, [history]);
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
