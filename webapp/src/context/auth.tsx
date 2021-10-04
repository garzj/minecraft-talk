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

  // Login
  useEffect(() => {
    socket.emit('get-player-data');
  }, []);
  useSubSocket(
    'player-data',
    useCallback((player: PlayerData) => setAuth(player), [setAuth])
  );

  return (
    <authContext.Provider value={auth}>
      {auth ? children : null}
    </authContext.Provider>
  );
};

export const useAuth = () => useContext(authContext);
