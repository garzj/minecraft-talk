import { useCallback, useState } from 'react';
import { RTCConnData } from '../../shared/types/rtc';
import { socketEmit, useSocketLoader, useSocketOn } from '../bin/socket';
import { useAuth } from '../context/auth';
import { ListPlayer } from './ListPlayer';
import { PlayerConn } from './PlayerConn';
import './Talk.scss';

const Talk: React.FC = () => {
  const [conns, setConns] = useState<{ [socketId: string]: RTCConnData }>({});

  const auth = useAuth();

  // RTC connections
  const onRtcConnect = useCallback((connData: RTCConnData) => {
    setConns((conns) => ({ ...conns, [connData.to.socketId]: connData }));
  }, []);
  useSocketOn('rtc-connect', onRtcConnect);

  const onRtcDisconnect = useCallback((socketId: string) => {
    setConns((conns) => {
      const newConns = { ...conns };
      delete newConns[socketId];
      return newConns;
    });
  }, []);
  useSocketOn('rtc-disconnect', onRtcDisconnect);

  // Init talk
  useSocketLoader(
    useCallback(() => {
      socketEmit('init-talk');

      return () => setConns({});
    }, []),
  );

  return (
    <div className='player-list'>
      <ListPlayer player={auth} />
      {Object.values(conns).map((conn) => (
        <PlayerConn key={conn.to.socketId} conn={conn} />
      ))}
    </div>
  );
};

export default Talk;
